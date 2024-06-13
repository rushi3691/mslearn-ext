import { ask_gemini, build_gemini_input } from './gemini';
import { sendMsg } from './utils';

export async function fill_quiz_form() {
    // .quiz-form
    console.log('fill_quiz_form');
    const quizForm = document.querySelector('.quiz-form');
    if (quizForm === null) {
        console.log('Quiz form not found');
        return;
    }
    console.log("Quiz form found!!")

    // #unit-inner-section > form > fieldset > button
    const submitButton = document.querySelector(
        '#unit-inner-section > form > fieldset > button'
    );

    if (submitButton === null) {
        console.log('Submit button not found');
        return;
    }

    const quizQuestions = quizForm.querySelectorAll('.quiz-question');
    const questions_and_options = []; // [{ question: 'question', options: ['option1', 'option2', 'option3', 'option4'] }]
    quizQuestions.forEach((question, idx) => {
        const qdata = {};
        qdata.question = question.querySelector(`#quiz-question-${idx + 1}`).textContent.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(); // remove new lines and extra spaces
        qdata.options = [];
        const options = question.querySelectorAll('.quiz-choice');
        qdata.option_elms = options;
        options.forEach((option, oidx) => {
            const opt = option.textContent?.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            qdata.options.push(`${oidx + 1}. ${opt}`);
        });
        questions_and_options.push(qdata);

    });

    console.log(questions_and_options);

    const prompt = build_gemini_input(questions_and_options);
    console.log(prompt);

    const qna = {}; // {1: option1, 2: option2, 3: option3} i.e. {QUESTION_NUMBER: OPTION_ELEMENT}

    try {
        console.log("Asking Gemini")
        const ai_soln = await ask_gemini(prompt);
        console.log("AI SOLN:\n", ai_soln)
        const soln = format_ai_output(ai_soln);
        console.log("SOLN:\n", soln);

        soln.forEach((ans) => {
            const qdata = questions_and_options[ans.QUESTION_NUMBER - 1];
            const option = qdata.option_elms[ans.OPTION_NUMBER - 1];
            console.log(option)
            // option.click();
            qna[ans.QUESTION_NUMBER] = option;
        });
    } catch (e) {
        console.log(e);
    }

    try {

        for (let i = 0; i < questions_and_options.length; i++) {
            if (qna[i + 1] === undefined) {
                let randomOption = Math.floor(Math.random() * questions_and_options[i].option_elms.length); // ranges from 0 to option length - 1
                qna[i + 1] = questions_and_options[i].option_elms[randomOption];
            }
            qna[i + 1].click();
        }

        // sleep 1 second
        await new Promise(r => setTimeout(r, 1000));

        // #unit-inner-section > form > fieldset > button
        submitButton.click();

    } catch (e) {
        console.log(e);
    }

    continue_to_next();
}

function format_ai_output(ai_output) {
    // OUTPUT:
    // Q1: O1
    // Q2: O3
    // Q3: O2
    // Q4: O1 

    const lines = ai_output.split('\n');
    const output = [];
    lines.forEach((line, idx) => {
        if (line.trim() === '' || line[0] !== 'Q') return;
        const parts = line.trim().split(':');
        let qnum = parseInt(parts[0].replace('Q', ''));
        if (isNaN(qnum)) {
            qnum = idx + 1;
        }
        let onum = parseInt(parts[1].replace('O', ''));
        if (isNaN(onum) || onum < 1) {
            onum = 1;
        }
        output.push({ QUESTION_NUMBER: qnum, OPTION_NUMBER: onum });
    });
    return output;
}

function continue_to_next() {
    // #quiz-button-holder > div > a
    let counter = 0;
    const intervalId = setInterval(() => {
        const continueButton = document.querySelector('#quiz-button-holder > div > a');
        if (continueButton !== null) {
            console.log('Continue button found');
            continueButton.click();
            clearInterval(intervalId);
        } else if (counter === 10) {
            console.log('Continue button not found');
            clearInterval(intervalId);
        }
        counter++;
    }, 1000); // Check every second
}
