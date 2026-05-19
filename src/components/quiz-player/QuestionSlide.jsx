import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnswerButton from './AnswerButton';

export default function QuestionSlide({ question, questionIndex, onAnswer, accentColor }) {
  return (
    <motion.div
      key={questionIndex}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      {question.image_url && (
        <div className="mb-6 rounded-xl overflow-hidden max-h-64">
          <img
            src={question.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-8 leading-tight text-center">
        {question.text}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.answers?.map((answer, idx) => (
          <AnswerButton
            key={idx}
            answer={answer}
            index={idx}
            onSelect={onAnswer}
            accentColor={accentColor}
          />
        ))}
      </div>
    </motion.div>
  );
}