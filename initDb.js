import faker from "faker";
import bycrpt from "bcrypt";
import db from "./src/models/index.js";
const { User, Board } = db;
faker.locale = "ko";

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.ceil(max);
  return Math.floor(Math.random() * (max - min) + min);
};

const user_sync = async () => {
  try {
    await User.sync({ force: true });
    for (let i = 0; i < 1000; i++) {
      const hashpwd = await bycrpt.hash("test1234", 10);
      await User.create({
        name: faker.name.lastName() + faker.name.firstName(),
        age: getRandomInt(15, 50),
        password: hashpwd,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const board_sync = async () => {
  try {
    await Board.sync({ force: true });
    for (let i = 0; i < 1000; i++) {
      await Board.create({
        title: faker.lorem.sentences(1),
        content: faker.lorem.sentences(10),
        userId: getRandomInt(1, 1000),
      });
    }
  } catch (err) {
    console.log(err);
  }
};

await user_sync();
await board_sync();