TOPIC TESTS: HOW TO ADD QUESTIONS
=================================
The app shows a "Topic test" button on a task, and a "Topic tests" list in Library, only for topics that have questions.
Nothing is bundled: add the questions you are licensed to use (for example your own, or a source that allows it).

1. Make a spreadsheet with these headers in row 1 and save it as CSV (UTF-8):
   exam,subject,topic,question,A,B,C,D,answer,explanation,source
   exam keys: neetpg, neetss, neetssmed, inicet, netjrfhi, netjrfen, upsccms
   subject and topic must be copied exactly from the app (they come from exams.js / exams2.js).
   answer is A, B, C or D. explanation and source (for example "NEET PG 2023") are optional.
2. From the project folder run:   node tools/qbank-build.js my-questions.csv
   It writes qbank/<exam>.js and lists any row it had to reject.
3. Deploy. Each test picks up to 20 random questions for the topic, shuffles the options, and can save the score to the task's study log.
