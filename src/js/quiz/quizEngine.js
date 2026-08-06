import { shuffle } from '../utils.js';

/**
 * Motor do questionário: mantém estado de perguntas embaralhadas,
 * alternativas embaralhadas e respostas, de forma independente da UI.
 */
export class QuizEngine {
  constructor(lesson) {
    this.title = lesson.titulo;
    this.entries = [];

    for (const question of lesson.perguntas) {
      const altOrder = shuffle(question.alternativas.map((_, index) => index));
      this.entries.push({
        id: question.id,
        pergunta: question.pergunta,
        explicacao: question.explicacao || '',
        alternativas: altOrder.map((index) => question.alternativas[index]),
        correctPosition: altOrder.indexOf(question.correta)
      });
    }

    shuffle(this.entries);

    this.answers = {};
    this.currentIndex = 0;
  }

  get total() {
    return this.entries.length;
  }

  get current() {
    return this.entries[this.currentIndex];
  }

  get isAnswered() {
    return Object.prototype.hasOwnProperty.call(this.answers, this.current.id);
  }

  get isLast() {
    return this.currentIndex === this.total - 1;
  }

  get answeredCount() {
    return Object.keys(this.answers).length;
  }

  select(position) {
    this.answers[this.current.id] = position;
  }

  next() {
    if (!this.isLast && this.isAnswered) this.currentIndex += 1;
  }

  prev() {
    if (this.currentIndex > 0) this.currentIndex -= 1;
  }
}