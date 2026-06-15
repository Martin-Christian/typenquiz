import React from 'react';
import { motion } from 'framer-motion';
import AnswerButton from './AnswerButton';

export default function QuestionSlide({ question, questionIndex, onAnswer }) {
  return (
    <motion.div
      key={questionIndex}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Question box */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-center">
        {question.image_url && (
          <img
            src={question.image_url}
            alt=""
            className="w-full h-48 md:h-56 object-cover"
          />
        )}
        <div className="px-6 py-6 md:py-8">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
            {question.text}
          </h2>
        </div>
      </div>

      {/* Answer grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.answers?.map((answer, idx) => (
          <AnswerButton
            key={idx}
            answer={answer}
            index={idx}
            onSelect={onAnswer}
          />
        ))}
      </div>
    </motion.div>
  );
}