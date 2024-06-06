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


    for (let tries = 0; tries < 3; tries++) {
        try {

            const ai_soln = await ask_gemini(prompt);
            console.log("AI SOLN:\n", ai_soln)
            const soln = format_ai_output(ai_soln);
            console.log("SOLN:\n", soln);

            soln.forEach((ans) => {
                const qdata = questions_and_options[ans.QUESTION_NUMBER - 1];
                const option = qdata.option_elms[ans.OPTION_NUMBER - 1];
                console.log(option)
                option.click();
            });

            // #unit-inner-section > form > fieldset > button
            submitButton.click();
            break;
        } catch (e) {
            sendMsg("Error in fill_quiz_form")
            console.log(e);
        }
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


// USER INPUT: 
// Q1.What is a role definition in Azure ?
// 1. A collection of permissions with a name that is assignable to a user, group, or application
// 2. The collection of users, groups, or applications that have permissions to a role
// 3. The binding of a role to a security principal at a specific scope, to grant access
// Q2.Suppose an administrator wants to assign a role to allow a user to create and manage Azure resources but not be able to grant access to others.Which of the following built -in roles would support this ?
// 1. Owner
// 2. Contributor
// 3. Reader
// 4. User Access Administrator
// Q3.What is the inheritance order for scope in Azure ?
// 1. Management group, Resource group, Subscription, Resource
// 2. Management group, Subscription, Resource group, Resource
// 3. Subscription, Management group, Resource group, Resource
// 4. Subscription, Resource group, Management group, Resource
// OUTPUT: [{ QUESTION_NUMBER }: { OPTION_NUMBER }]


// [
//     { "QUESTION_NUMBER": 1, "OPTION_NUMBER": 1 },
//     { "QUESTION_NUMBER": 2, "OPTION_NUMBER": 2 },
//     { "QUESTION_NUMBER": 3, "OPTION_NUMBER": 2 }
// ]

//     ```
// Please answer the following multiple choice questions. Provide your answer only as JSON in the following format:

// ```json
// [
//     { "QUESTION_NUMBER": 1, "OPTION_NUMBER": 1 },
//     { "QUESTION_NUMBER": 2, "OPTION_NUMBER": 2 },
//     { "QUESTION_NUMBER": 3, "OPTION_NUMBER": 2 }
// ]
//     ```

// **Questions:**

// [Insert your questions here, each with multiple choice options]

// **Example:**

// Q1. What is the capital of France?
// 1. Berlin
// 2. Paris
// 3. Rome
// 4. London

// Q2. What is the largest planet in our solar system?
// 1. Mars
// 2. Jupiter
// 3. Venus
// 4. Earth 
// ```

// This prompt will ensure you always get the output in the desired JSON format, regardless of the questions asked. 

