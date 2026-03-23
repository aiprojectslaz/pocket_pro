import type { Schema, Attribute } from '@strapi/strapi';

export interface QuizComponentsAnswerOption extends Schema.Component {
  collectionName: 'components_quiz_components_answer_options';
  info: {
    displayName: 'answerOption';
    icon: 'bulletList';
  };
  attributes: {
    optionText: Attribute.String;
    isCorrect: Attribute.Boolean;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'quiz-components.answer-option': QuizComponentsAnswerOption;
    }
  }
}
