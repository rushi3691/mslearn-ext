const GEMINI_API_KEY = "AIzaSyC4VDEqhavkybPWfypjq50v5zcXbRLrndY";
// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;


/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

// const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: "OUTPUT: {QUESTION_NUMBER}:{OPTION_NUMBER}",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};


export async function ask_gemini(text) {
    const chatSession = model.startChat({
        generationConfig,
        // safetySettings: Adjust safety settings
        // See https://ai.google.dev/gemini-api/docs/safety-settings
        history: [
            {
                role: "user",
                parts: [
                    { text: "Q1. What is a role definition in Azure?\nO1. A collection of permissions with a name that is assignable to a user, group, or application\nO2. The collection of users, groups, or applications that have permissions to a role\nO3. The binding of a role to a security principal at a specific scope, to grant access\nQ2. Suppose an administrator wants to assign a role to allow a user to create and manage Azure resources but not be able to grant access to others. Which of the following built-in roles would support this?\nO1. Owner\nO2. Contributor\nO3. Reader\nO4. User Access Administrator\nQ3. What is the inheritance order for scope in Azure?\nO1. Management group, Resource group, Subscription, Resource\nO2. Management group, Subscription, Resource group, Resource\nO3. Subscription, Management group, Resource group, Resource\nO4. Subscription, Resource group, Management group, Resource" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "OUTPUT: \nQ1:O1\nQ2:O2\nQ3:O2 \n" },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage(text);
    const textResult = result.response.text();
    return textResult;
}


export function build_gemini_input(questions_and_options) {
    let text = "";
    questions_and_options.forEach((qdata, idx) => {
        text += `Q${qdata.question}\n`;
        qdata.options.forEach((opt) => {
            text += `O${opt}\n`;
        });
    });

    //     const prompt = `Please answer the following multiple choice questions. Provide your answer only as JSON in the following format:
    // \`\`\`json
    //     [
    //         { "QUESTION_NUMBER": 1, "OPTION_NUMBER": 1 },
    //         { "QUESTION_NUMBER": 2, "OPTION_NUMBER": 2 },
    //         { "QUESTION_NUMBER": 3, "OPTION_NUMBER": 2 }
    //     ]
    // \`\`\`

    // Questions:
    // ${text}`;

    const prompt = text;
    return prompt;
}