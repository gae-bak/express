import { Router } from "express";
import _ from "lodash";
import sequelize from "sequelize";
import faker from "faker";
import bcrypt from "bcrypt";
import db from "../models/index.js";

faker.locale = "ko";
const User = db.User;

const seq = new sequelize('express', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

const check_sequelize_auth = async () => {
  try{
    await seq.authenticate();
    console.log("연결 성공");
  }catch(err){
    console.log("연결 실패", err);
  }
};

check_sequelize_auth();
// 유저 모델(테이블) 정의
// const User = seq.define("user", {
//   name: {
//     type: sequelize.STRING,
//     allowNull: false

//   },
//   age: {
//     type: sequelize.INTEGER,
//     allowNull: false
//   },
//   password: {
//     type: sequelize.STRING,
//     allowNull: false
//   }
// });
// 컬럼 생성(비동기식)
const user_sync = async() =>{
  try{
    //상시연결
    await User.sync({ force: true});
 for(let i=0; i < 100; i++){
   User.create({
   name: faker.name.lastName()+faker.name.firstName(),
   age: getRandomInt(15,50)
  })
 }
  }catch(err){
    console.log(err);
  }
}

//user_sync();

const userRouter = Router();

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}


// userRouter.get("/", async(req, res)=> {
//   let {name, age} =req.query;
//   const result = await User.findAll();

//   res.send({
//     result
//   })
// });

// 유저 조회
userRouter.get("/", async(req, res)=> {
  let {name, age} =req.query;
  const { Op } = sequelize;
  try{
    const findUserQuery = {
      attributes: ['id','name','age']
    }
    let result;
    if (name&&age){
      findUserQuery['where'] = {name: {[Op.substring]: name}, age }
    }else if(name) {
      findUserQuery['where'] = {name: {[Op.substring]: name} }
    }else if(age) {
      findUserQuery['where'] = { age }
    }

    result = await User.findAll(findUserQuery);

    res.status(200).send({
      count: result.length,
      result
    })
  }catch(err){
    res.status(500).send(err)
  }

});
// .name(); .destroy(); 수정,삭제

// 유저 생성
userRouter.post("/", async(req, res) =>{
  try{
    const { name, age} = req.body;
    if (!name || !age)
     res.status(400).send({msg: "입력 요청값이 잘못되었습니다."});

     const result = await User.create({
       name,
       age
     });
     res.status(201).send({
       msg: `id ${result.id}, ${result.name} 유저가 생성되었습니다.`
     });
  }catch(err){
    console.log(err);
    res.status(500).send({msg : `서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.`})
  }
  res.send({
    result
  });
});


userRouter.get("/test/: id", async(req, res) => {
  try{
    // const result = await User.create({
    //   name: "테스트",
    //   age: 55

    // });
    // console.log(result.id);

    // const findUser = await User.findOne({
    //   where {
    //     id: req.params.id
    //   }
    // });
    res.status(200).send(true)
  }catch(err){
    console.log(err);
    res.status(500).send({msg: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."})
  }
})
// 유저 수정
userRouter.put("/:id", async (req, res) => {
  try {
    const updateUser = req.params.id;
    const updateUserName = req.body.name;
    const updateUserAge = req.body.age;
    const { Op } = sequilize;

    if (!updateUser || (!updateUserName && !updateUserAge)) {
      res
        .status(400)
        .send("유저가 존재하지 않거나 입력 요청이 잘못되었습니다.");
    }

    const findUserQuery = await User.findOne({
      where: {
        id: { [Op.eq]: updateUser },
      },
    });

    let updateUserQuery;

    if (updateUserName && updateUserAge) {
      updateUserQuery = await User.update(
        { name: updateUserName, age: updateUserAge },
        {
          where: {
            id: { [Op.eq]: updateUser },
          },
        }
      );
    } else if (updateUserName) {
      updateUserQuery = await User.update(
        { name: updateUserName },
        {
          where: {
            id: { [Op.eq]: updateUser },
          },
        }
      );
    } else if (updateUserAge) {
      updateUserQuery = await User.update(
        { age: updateUserAge },
        {
          where: {
            id: { [Op.eq]: updateUser },
          },
        }
      );
    }
    res.status(200).send({
      msg: `${updateUser}님 수정을 완료하였습니다.`,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});
//유저 삭제
userRouter.delete("/:id", async (req, res) => {
  //auth체크 + 권한, 본인 체크
  try {
    let user = await User.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!user) {
      res.status(400).send({ msg: "유저가 존재하지 않습니다." });
    }

    await user.destroy();
    res.status(200).send({ mgs: "유저정보가 정상적으로 삭제 되었습니다." });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ msg: "서버에 문제가 발생했습니다. 잠시 후 시도해 주세요" });
  }
});

userRouter.get("/test/:id", async (req, res) => {
  const { Op } = sequilize;
  try {
    // findAll
    const userResult = await User.findAll({
      attributes: ["id", "name", "age"],
      where: {
        [Op.or]: [
          {
            name: { [Op.startsWith]: "김" },
            age: { [Op.between]: [30, 40] },
          },
          {
            name: { [Op.startsWith]: "이" },
            age: { [Op.between]: [30, 40] },
          },
        ],
      },
      order: [
        ["name", "ASC"],
        ["age", "DESC"],
      ],
    });

    const boardResult = await Board.findAll({
      limit: 100,
      attributes: ["id", "title"],
    });

    const user = await User.findOne({
      where: { id: req.params.id },
    });
    const board = await Board.findOne({
      where: { id: req.params.id },
    });

    if (!user || !board) {
      res.status(400).send({ msg: "해당 정보가 존재하지 않습니다." });
    }
    await user.destroy();
    board.title += "test 타이틀 입니다.";
    await board.save();

    res.status(200).send({
      board,
      users: {
        count: userResult.length,
        data: userResult,
      },
      boards: {
        count: boardResult.length,
        data: boardResult,
      },
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ msg: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
});


export default userRouter;