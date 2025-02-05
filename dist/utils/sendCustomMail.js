"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mail_1 = __importDefault(require("@sendgrid/mail"));
const environment_config_1 = __importDefault(require("../config/environment.config"));
const logger_1 = __importDefault(require("./logger"));
mail_1.default.setApiKey(environment_config_1.default.email.apiKey);
const msg = {
    to: ['mybusiness6691@gmail.com'],
    from: {
        name: "Test Email",
        email: environment_config_1.default.email.fromEmail,
    },
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
const sendEmail = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mail_1.default.send(msg);
        logger_1.default.info('Email has been sent!');
    }
    catch (error) {
        console.error(error);
        if (error) {
            console.error(error);
        }
    }
});
sendEmail();
