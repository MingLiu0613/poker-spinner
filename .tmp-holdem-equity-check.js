
    const STREET_ORDER = ['preflop', 'flop', 'turn', 'river'];
    const STREET_BOARD_COUNT = { preflop: 0, flop: 3, turn: 4, river: 5 };
    const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const RANK_VALUE = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
      '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    const SUITS = [
      { key: 's', symbol: '♠', colorClass: 'suit-black' },
      { key: 'h', symbol: '♥', colorClass: 'suit-red' },
      { key: 'd', symbol: '♦', colorClass: 'suit-red' },
      { key: 'c', symbol: '♣', colorClass: 'suit-black' }
    ];
    const FULL_DECK = [];

    for (const rank of RANKS) {
      for (const suit of SUITS) {
        FULL_DECK.push(rank + suit.key);
      }
    }

    const state = {
      street: 'preflop',
      hero: [null, null],
      board: [null, null, null, null, null],
      villains: [{ id: 1, cards: [null, null] }]
    };

    let villainIdCounter = 2;
    let activeSlot = null;
    let calcVersion = 0;

    const streetButtons = document.getElementById('streetButtons');
    const heroHand = document.getElementById('heroHand');
    const boardCards = document.getElementById('boardCards');
    const villains = document.getElementById('villains');
    const addVillainBtn = document.getElementById('addVillainBtn');
    const results = document.getElementById('results');
    const statusBox = document.getElementById('statusBox');
    const methodLabel = document.getElementById('methodLabel');
    const sampleLabel = document.getElementById('sampleLabel');
    const pickerBackdrop = document.getElementById('pickerBackdrop');
    const pickerGrid = document.getElementById('pickerGrid');
    const pickerTitle = document.getElementById('pickerTitle');
    const closePickerBtn = document.getElementById('closePickerBtn');
    const clearCardBtn = document.getElementById('clearCardBtn');

    function suitMeta(card) {
      const suit = card ? card[1] : null;
      return SUITS.find(item => item.key === suit) || SUITS[0];
    }

    function formatCard(card, label) {
      if (!card) {
        return `<span class="card-placeholder">${label}</span>`;
      }

      const meta = suitMeta(card);
      return `<span class="card-rank">${card[0]}</span><span class="card-suit ${meta.colorClass}">${meta.symbol}</span>`;
    }

    function slotMarkup(card, label, key, hidden) {
      const selected = card ? 'selected' : '';
      const hiddenClass = hidden ? 'hidden-slot' : '';
      const disabled = hidden ? 'disabled' : '';
      return `<button class="card-slot ${selected} ${hiddenClass}" data-slot="${key}" type="button" ${disabled}>${formatCard(card, label)}</button>`;
    }

    function renderStreets() {
      streetButtons.innerHTML = STREET_ORDER.map(street => `
        <button class="street-btn ${state.street === street ? 'active' : ''}" type="button" data-street="${street}">
          ${street.charAt(0).toUpperCase() + street.slice(1)}
        </button>
      `).join('');
    }

    function renderHero() {
      heroHand.innerHTML = `
        <div class="hand-block">
          <div class="hand-head">
            <div class="hero-tag">
              <span class="tag-dot"></span>
              <span class="hand-name">Hero hand</span>
            </div>
          </div>
          <div class="card-row">
            ${slotMarkup(state.hero[0], 'Card 1', 'hero-0', false)}
            ${slotMarkup(state.hero[1], 'Card 2', 'hero-1', false)}
          </div>
        </div>
      `;
    }

    function renderBoard() {
      const visibleCount = STREET_BOARD_COUNT[state.street];
      boardCards.innerHTML = state.board.map((card, index) => slotMarkup(card, `Board ${index + 1}`, `board-${index}`, index >= visibleCount)).join('');
    }

    function renderVillains() {
      villains.innerHTML = state.villains.map((villain, index) => `
        <div class="hand-block">
          <div class="hand-head">
            <div class="hero-tag">
              <span class="tag-dot villain-dot"></span>
              <span class="hand-name">Villain ${index + 1}</span>
            </div>
            ${state.villains.length > 1 ? `<button class="remove-btn" type="button" data-remove="${villain.id}">Remove</button>` : ''}
          </div>
          <div class="card-row">
            ${slotMarkup(villain.cards[0], 'Card 1', `villain-${villain.id}-0`, false)}
            ${slotMarkup(villain.cards[1], 'Card 2', `villain-${villain.id}-1`, false)}
          </div>
        </div>
      `).join('');
    }

    function renderAll() {
      renderStreets();
      renderHero();
      renderBoard();
      renderVillains();
      bindInteractions();
    }

    function bindInteractions() {
      streetButtons.querySelectorAll('[data-street]').forEach(button => {
        button.addEventListener('click', () => {
          state.street = button.dataset.street;
          const visibleCount = STREET_BOARD_COUNT[state.street];
          for (let index = visibleCount; index < state.board.length; index += 1) {
            state.board[index] = null;
          }
          renderAll();
          queueCalculation();
        });
      });

      document.querySelectorAll('[data-slot]').forEach(button => {
        if (!button.disabled) {
          button.addEventListener('click', () => openPicker(button.dataset.slot));
        }
      });

      document.querySelectorAll('[data-remove]').forEach(button => {
        button.addEventListener('click', () => {
          state.villains = state.villains.filter(villain => String(villain.id) !== button.dataset.remove);
          renderAll();
          queueCalculation();
        });
      });
    }

    function addVillain() {
      state.villains.push({ id: villainIdCounter, cards: [null, null] });
      villainIdCounter += 1;
      renderAll();
      queueCalculation();
    }

    function setSlotValue(slotKey, card) {
      const [kind, id, cardIndex] = slotKey.split('-');

      if (kind === 'hero') {
        state.hero[Number(id)] = card;
      } else if (kind === 'board') {
        state.board[Number(id)] = card;
      } else if (kind === 'villain') {
        const villain = state.villains.find(item => item.id === Number(id));
        if (villain) villain.cards[Number(cardIndex)] = card;
      }
    }

    function getUsedCards(excludeSlot) {
      const cards = [];
      state.hero.forEach((card, index) => {
        if (card && excludeSlot !== `hero-${index}`) cards.push(card);
      });

      const visibleCount = STREET_BOARD_COUNT[state.street];
      state.board.forEach((card, index) => {
        if (index < visibleCount && card && excludeSlot !== `board-${index}`) cards.push(card);
      });

      state.villains.forEach(villain => {
        villain.cards.forEach((card, index) => {
          if (card && excludeSlot !== `villain-${villain.id}-${index}`) cards.push(card);
        });
      });

      return new Set(cards);
    }

    function openPicker(slotKey) {
      activeSlot = slotKey;
      const usedCards = getUsedCards(slotKey);
      pickerTitle.textContent = slotKey.startsWith('hero') ? 'Select hero card' : slotKey.startsWith('board') ? 'Select board card' : 'Select villain card';
      pickerGrid.innerHTML = FULL_DECK.map(card => {
        const meta = suitMeta(card);
        const disabled = usedCards.has(card) ? 'disabled' : '';
        return `<button class="picker-card" type="button" data-card="${card}" ${disabled}><span>${card[0]}</span><span class="${meta.colorClass}">${meta.symbol}</span></button>`;
      }).join('');

      pickerGrid.querySelectorAll('[data-card]').forEach(button => {
        button.addEventListener('click', () => {
          setSlotValue(activeSlot, button.dataset.card);
          closePicker();
          renderAll();
          queueCalculation();
        });
      });

      pickerBackdrop.classList.add('open');
      pickerBackdrop.setAttribute('aria-hidden', 'false');
    }

    function closePicker() {
      activeSlot = null;
      pickerBackdrop.classList.remove('open');
      pickerBackdrop.setAttribute('aria-hidden', 'true');
    }

    function combinations(array, choose) {
      const result = [];
      const path = [];

      function visit(start) {
        if (path.length === choose) {
          result.push(path.slice());
          return;
        }

        for (let index = start; index <= array.length - (choose - path.length); index += 1) {
          path.push(array[index]);
          visit(index + 1);
          path.pop();
        }
      }

      visit(0);
      return result;
    }

    function combinationCount(n, k) {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      const picks = Math.min(k, n - k);
      let total = 1;
      for (let step = 1; step <= picks; step += 1) {
        total = (total * (n - picks + step)) / step;
      }
      return Math.round(total);
    }

    function encodeRanks(category, kickers) {
      let score = category;
      for (const kicker of kickers) {
        score = score * 15 + kicker;
      }
      return score;
    }

    function evaluateFive(cards) {
      const ranks = cards.map(card => RANK_VALUE[card[0]]).sort((a, b) => b - a);
      const suits = cards.map(card => card[1]);
      const counts = {};

      for (const rank of ranks) {
        counts[rank] = (counts[rank] || 0) + 1;
      }

      const groups = Object.entries(counts)
        .map(([rank, count]) => ({ rank: Number(rank), count }))
        .sort((a, b) => b.count - a.count || b.rank - a.rank);
      const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);
      let straightHigh = 0;

      if (uniqueRanks.length === 5) {
        if (uniqueRanks[0] - uniqueRanks[4] === 4) {
          straightHigh = uniqueRanks[0];
        } else if (uniqueRanks.join(',') === '14,5,4,3,2') {
          straightHigh = 5;
        }
      }

      const flush = suits.every(suit => suit === suits[0]);
      if (straightHigh && flush) return encodeRanks(8, [straightHigh, 0, 0, 0, 0]);
      if (groups[0].count === 4) return encodeRanks(7, [groups[0].rank, groups[1].rank, 0, 0, 0]);
      if (groups[0].count === 3 && groups[1].count === 2) return encodeRanks(6, [groups[0].rank, groups[1].rank, 0, 0, 0]);
      if (flush) return encodeRanks(5, ranks);
      if (straightHigh) return encodeRanks(4, [straightHigh, 0, 0, 0, 0]);
      if (groups[0].count === 3) {
        const kickers = groups.slice(1).map(group => group.rank).sort((a, b) => b - a);
        return encodeRanks(3, [groups[0].rank, ...kickers, 0, 0].slice(0, 5));
      }
      if (groups[0].count === 2 && groups[1].count === 2) {
        const pairRanks = [groups[0].rank, groups[1].rank].sort((a, b) => b - a);
        return encodeRanks(2, [pairRanks[0], pairRanks[1], groups[2].rank, 0, 0]);
      }
      if (groups[0].count === 2) {
        const kickers = groups.slice(1).map(group => group.rank).sort((a, b) => b - a);
        return encodeRanks(1, [groups[0].rank, ...kickers].slice(0, 5));
      }
      return encodeRanks(0, ranks);
    }

    function evaluateSeven(cards) {
      const combos = combinations(cards, 5);
      let best = -1;
      for (const combo of combos) {
        const score = evaluateFive(combo);
        if (score > best) best = score;
      }
      return best;
    }

    function compareHands(players, board) {
      const scores = players.map(player => evaluateSeven(player.cards.concat(board)));
      const best = Math.max(...scores);
      const winners = [];
      scores.forEach((score, index) => {
        if (score === best) winners.push(index);
      });
      return winners;
    }

    function formatPercent(value) {
      return `${value.toFixed(1)}%`;
    }

    function shuffleInPlace(cards) {
      for (let index = cards.length - 1; index > 0; index -= 1) {
        const rand = Math.floor(Math.random() * (index + 1));
        [cards[index], cards[rand]] = [cards[rand], cards[index]];
      }
      return cards;
    }

    function buildPlayerList() {
      return [
        { name: 'Hero', type: 'hero', cards: state.hero.slice() },
        ...state.villains.map((villain, index) => ({
          name: `Villain ${index + 1}`,
          type: 'villain',
          cards: villain.cards.slice()
        }))
      ];
    }

    function validateState() {
      const players = buildPlayerList();
      const visibleBoard = state.board.slice(0, STREET_BOARD_COUNT[state.street]);

      if (state.hero.some(card => !card)) {
        return { ok: false, message: 'Select both hero cards to calculate win rate.' };
      }

      for (const player of players.slice(1)) {
        if (player.cards.some(card => !card)) {
          return { ok: false, message: 'Each villain needs two hole cards before the calculator can run.' };
        }
      }

      if (visibleBoard.some(card => !card)) {
        return { ok: false, message: `Add all ${visibleBoard.length} visible board cards for the ${state.street} scenario.` };
      }

      const used = [...state.hero, ...visibleBoard, ...state.villains.flatMap(villain => villain.cards)].filter(Boolean);
      if (new Set(used).size !== used.length) {
        return { ok: false, message: 'Every card must be unique across hero, villains, and board.' };
      }

      return { ok: true, players, visibleBoard };
    }

    function renderResults(outcome) {
      methodLabel.textContent = outcome.method;
      sampleLabel.textContent = String(outcome.samples);
      statusBox.textContent = outcome.status;
      statusBox.className = `status ${outcome.ready ? 'ready' : ''}`.trim();
      results.innerHTML = outcome.rows.map(row => `
        <div class="result-item">
          <div class="result-top">
            <div class="result-name">${row.name}</div>
            <div class="result-equity">${formatPercent(row.equity)}</div>
          </div>
          <div class="bar">
            <div class="bar-fill ${row.type === 'villain' ? 'villain-fill' : ''}" style="width: ${Math.max(4, row.equity)}%"></div>
          </div>
          <div class="result-meta">
            <span>Win ${formatPercent(row.win)}</span>
            <span>Tie ${formatPercent(row.tie)}</span>
          </div>
        </div>
      `).join('');
    }

    function pendingOutcome(message) {
      renderResults({
        method: 'Waiting',
        samples: 0,
        status: message,
        ready: false,
        rows: []
      });
    }

    function exactSimulation(players, board, deck, missingBoardCount) {
      const boardCombos = combinations(deck, missingBoardCount);
      const wins = new Array(players.length).fill(0);
      const ties = new Array(players.length).fill(0);
      const equityShares = new Array(players.length).fill(0);

      for (const combo of boardCombos) {
        const finalBoard = board.concat(combo);
        const winners = compareHands(players, finalBoard);
        if (winners.length === 1) {
          wins[winners[0]] += 1;
          equityShares[winners[0]] += 1;
        } else {
          winners.forEach(index => {
            ties[index] += 1;
            equityShares[index] += 1 / winners.length;
          });
        }
      }

      return { method: 'Exact', samples: boardCombos.length, wins, ties, equityShares };
    }

    function monteCarloSimulation(players, board, deck, missingBoardCount) {
      const sampleCount = missingBoardCount === 5 ? 25000 : 18000;
      const wins = new Array(players.length).fill(0);
      const ties = new Array(players.length).fill(0);
      const equityShares = new Array(players.length).fill(0);

      for (let sample = 0; sample < sampleCount; sample += 1) {
        const shuffled = shuffleInPlace(deck.slice());
        const finalBoard = board.concat(shuffled.slice(0, missingBoardCount));
        const winners = compareHands(players, finalBoard);
        if (winners.length === 1) {
          wins[winners[0]] += 1;
          equityShares[winners[0]] += 1;
        } else {
          winners.forEach(index => {
            ties[index] += 1;
            equityShares[index] += 1 / winners.length;
          });
        }
      }

      return { method: 'Monte Carlo', samples: sampleCount, wins, ties, equityShares };
    }

    function calculateEquity() {
      const version = ++calcVersion;
      const validation = validateState();

      if (!validation.ok) {
        pendingOutcome(validation.message);
        return;
      }

      pendingOutcome('Running the calculation...');

      setTimeout(() => {
        if (version !== calcVersion) return;

        const { players, visibleBoard } = validation;
        const usedCards = new Set([...state.hero, ...visibleBoard, ...state.villains.flatMap(villain => villain.cards)].filter(Boolean));
        const deck = FULL_DECK.filter(card => !usedCards.has(card));
        const missingBoardCount = 5 - visibleBoard.length;
        const exactComboCount = combinationCount(deck.length, missingBoardCount);
        const simulation = exactComboCount <= 2500
          ? exactSimulation(players, visibleBoard, deck, missingBoardCount)
          : monteCarloSimulation(players, visibleBoard, deck, missingBoardCount);

        const rows = players.map((player, index) => {
          const total = simulation.samples;
          const win = (simulation.wins[index] / total) * 100;
          const tie = (simulation.ties[index] / total) * 100;
          const equity = (simulation.equityShares[index] / total) * 100;
          return { name: player.name, type: player.type, win, tie, equity };
        });

        const boardText = visibleBoard.length ? ` with ${visibleBoard.length} board card${visibleBoard.length === 1 ? '' : 's'} set` : '';
        renderResults({
          method: simulation.method,
          samples: simulation.samples,
          status: `${simulation.method} ${simulation.method === 'Exact' ? 'enumeration' : 'simulation'} complete for ${players.length} players${boardText}.`,
          ready: true,
          rows
        });
      }, 30);
    }

    function queueCalculation() {
      calculateEquity();
    }

    addVillainBtn.addEventListener('click', addVillain);
    closePickerBtn.addEventListener('click', closePicker);
    clearCardBtn.addEventListener('click', () => {
      if (!activeSlot) return;
      setSlotValue(activeSlot, null);
      closePicker();
      renderAll();
      queueCalculation();
    });
    pickerBackdrop.addEventListener('click', event => {
      if (event.target === pickerBackdrop) closePicker();
    });

    renderAll();
    pendingOutcome('Choose the hero hand, one villain hand, and any visible board cards to begin.');

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js');
    }
  