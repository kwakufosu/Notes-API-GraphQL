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
const user_1 = __importDefault(require("../models/user"));
const note_1 = __importDefault(require("../models/note"));
const auth_1 = __importDefault(require("../middleware/auth"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const resolvers = {
    Query: {
        greeting: () => 'Hello world',
        login: function (_, { input }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { email, password } = input;
                try {
                    const user = yield user_1.default.login(email, password);
                    const token = yield user.generateAuthToken();
                    return { user, token };
                }
                catch (e) {
                    throw new Error('Invalid credentials');
                }
            });
        },
        getCurrentUserDetails: function (root, _, { token }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = yield (0, auth_1.default)(token);
                return user;
            });
        },
        fetchNotesByAUser: function (root, _, { token }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = yield (0, auth_1.default)(token);
                const notes = yield note_1.default.find({ owner_id: user._id });
                if (!notes) {
                    return 'No notes found';
                }
                return notes;
            });
        },
        fetchUserNoteByID: function (root, { id }, { token }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = yield (0, auth_1.default)(token);
                const note = yield note_1.default.findOne({ _id: id, owner_id: user.id });
                if (!note) {
                    return 'No note found';
                }
                return note;
            });
        },
    },
    Mutation: {
        createUser: function (_, { input }) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const user = new user_1.default(input);
                    const token = yield user.generateAuthToken();
                    yield user.save();
                    return { user, token };
                }
                catch (e) {
                    console.log(e);
                    throw new Error('Unsucccessful');
                }
            });
        },
        updateCurrentUser: function (_, { input }, { token }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = yield (0, auth_1.default)(token);
                const userID = user._id.toString();
                if (input.password) {
                    input.password = yield bcrypt_1.default.hash(input.password, 8);
                }
                if (!user && !(userID === input._id.toString())) {
                    return;
                }
                const updatedUser = yield user_1.default.findOneAndUpdate({ _id: user._id }, Object.assign({}, input), { new: true, runValidators: true });
                yield (updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.save());
                return updatedUser;
            });
        },
        logoutCurrentUser: function (_, { _id }, { token }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user, tokenOnly } = yield (0, auth_1.default)(token);
                if (!(user._id.toString() === _id)) {
                    return;
                }
                user.tokens = user.tokens.filter((userToken) => {
                    return userToken.token !== tokenOnly;
                });
                yield user.save();
                return user;
            });
        },
        logoutAll: function (_, { _id }, { token }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = yield (0, auth_1.default)(token);
                if (!(user._id.toString() === _id)) {
                    return;
                }
                user.tokens = [];
                yield user.save();
                return user;
            });
        },
        deleteCurrentUser: function (_, { _id }, { token }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = yield (0, auth_1.default)(token);
                const deletedUser = user;
                if (!(user._id.toString() === _id)) {
                    return;
                }
                yield user.remove();
                return deletedUser;
            });
        },
        createNote: function (_, { input }, { token }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = yield (0, auth_1.default)(token);
                const note = new note_1.default(Object.assign(Object.assign({}, input), { owner_id: user._id }));
                yield note.save();
                return note;
            });
        },
        deleteUserNoteByID: function (_, { _id }, { token }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = yield (0, auth_1.default)(token);
                const deletedNote = yield note_1.default.findOneAndDelete({
                    _id,
                    owner_id: user._id,
                });
                if (!deletedNote) {
                    return 'No note found. Hence nothing was deleted';
                }
                return deletedNote;
            });
        },
        deleteAllNotesByUser: function (_, input, { token }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = yield (0, auth_1.default)(token);
                let deletedNotes = yield note_1.default.find({ owner_id: user._id });
                yield note_1.default.deleteMany({ owner_id: user._id });
                if (!deletedNotes) {
                    return 'No notes found. Hence nothing was deleted';
                }
                return deletedNotes;
            });
        },
        updateNote: function (_, { _id, input }, { token }) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = yield (0, auth_1.default)(token);
                const updatedNote = yield note_1.default.findOneAndUpdate({ owner_id: user._id, _id: _id }, { note: input }, { new: true, runValidators: true });
                yield (updatedNote === null || updatedNote === void 0 ? void 0 : updatedNote.save());
                return updatedNote;
            });
        },
    },
};
exports.default = resolvers;
