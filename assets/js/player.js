// @ts-check

/**
 * @readonly
 * @enum {string}
 */
const playerState = {
    Initial: 'Initial',
    Asking: 'Asking',
    Waiting: 'Waiting',
};

/**
 * @param {HTMLElement} a - the first element
 * @param {HTMLElement} b - the second element
 * @returns {boolean}
 */
function elsAreOverlapping(a, b) {
  const al = a.offsetLeft;
  const ar = a.offsetLeft + a.offsetWidth;
  const bl = b.offsetLeft;
  const br = b.offsetLeft + b.offsetWidth;

  const at = a.offsetTop;
  const ab = a.offsetTop + a.offsetHeight;
  const bt = b.offsetTop;
  const bb = b.offsetTop + b.offsetHeight;

  if (bl > ar || br < al) { return false; } // overlap not possible
  if (bt > ab || bb < at) { return false; } // overlap not possible

  return true;
};

/**
 * @param {any[]} arr
 */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

document.addEventListener('alpine:init', () => {
    Alpine.data('player', () => ({
        settings: {
            question: {
                playsAudio: true,
                showsImage: false,
                showsLabel: false,
            },
            answer: {
                playsAudio: false,
                showsImage: true,
                showsLabel: false,
            }
        },
        words: [],
        question: undefined,
        state: playerState.Initial,
        newQuestion() {
            if (this.words.length <= 0) return;

            const prevQuestion = this.question;
            const index = Math.floor(Math.random() * this.words.length);
            this.question = this.words[index];
            this.state = playerState.Asking;

            this.$dispatch('newquestion');
        },
        checkAnswer() {
            if (this.words.length <= 0) return;
            if (this.question === undefined) return;

            /** @type {HTMLElement} */
            const targetEl = this.$refs.target;
            /** @type {HTMLElement[]} */
            const moveableEls = Array.from(this.$root.querySelectorAll('.moveable'));
            const overlappingMoveables = moveableEls.filter((moveableEl) => elsAreOverlapping(moveableEl, targetEl));
             
            if (overlappingMoveables.length !== 1) return;

            const answer = overlappingMoveables[0].id;
            if (answer === this.question.label) {
                this.$dispatch('correct', { answer: answer } );
                this.state = playerState.Waiting;
            } else {
                this.$dispatch('incorrect', { answer: answer } );
            }
        },
    }));
});
