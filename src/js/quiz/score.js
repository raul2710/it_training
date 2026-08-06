/**
 * Calcula pontuação e o consolidado para a tela de revisão.
 * Recebe um QuizEngine já finalizado.
 */
export function computeScore(engine) {
  const total = engine.total;
  let correct = 0;

  const review = engine.entries.map((entry) => {
    const response = engine.answers[entry.id];
    const hasAnswered = typeof response === 'number';
    const isCorrect = hasAnswered && response === entry.correctPosition;
    if (isCorrect) correct += 1;

    return {
      pergunta: entry.pergunta,
      alternativas: entry.alternativas,
      correta: entry.correctPosition,
      resposta: hasAnswered ? response : null,
      explicacao: entry.explicacao,
      acertou: isCorrect
    };
  });

  const wrong = total - correct;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  const grade = total ? Math.round((correct / total) * 10 * 10) / 10 : 0;

  return { correct, wrong, total, percent, grade, review };
}