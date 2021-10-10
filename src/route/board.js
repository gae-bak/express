import { Router } from "express";
import _ from "lodash";
import faker from "faker";
import sequilize from "sequelize";

const seq = new sequilize("express", "root", "1234", {
  host: "localhost",
  dialect: "mysql",
});

const Board = seq.define("board", {
  title: {
    type: sequilize.STRING,
    allowNull: false,
  },
  content: {
    type: sequilize.TEXT,
    allowNull: true,
  },
});

const board_sync = async () => {
  try {
    await Board.sync({ force: true });
    for (let i = 0; i < 10000; i++) {
      await Board.create({
        title: faker.lorem.sentences(1),
        content: faker.lorem.sentences(10),
      });
    }
  } catch (err) {
    console.log(err);
  }
};

 //board_sync();

const boardRouter = Router();

let boards = [];

// 게시판 전체 조회
boardRouter.get("/", async(req, res) => {
  const boards = await Board.findAll();
  res.send({
    count: boards.length,
    boards,
  });
});

//게시판 id 값 조회
boardRouter.get("/:id", async(req, res) => {
  try{
    const findBoard = await Board.findOne({
      where: {
        id: req.params.id
      }
    });

    if(findBoard) {
      res.status(200).send({
        findBoard
      });
    }else{
      res.status(400).send({msg: '해당 아이디값을 가진 board가 없습니다.'});
    }
  }catch(err){
    console.log(err);
    res.status(500).send({msg: "서버에 문제가 발생하였습니다. 잠시 후 다시 시도해주세요"});
  }
});

// 게시판 생성
boardRouter.post("/", async(req, res) => {
  // const createBoard = req.body;
  // const check_board = _.find(boards, ["id", createBoard.id]);
  // let result;
  // if (
  //   !check_board &&
  //   createBoard.id &&
  //   createBoard.title &&
  //   createBoard.content &&
  //   createBoard.createDate &&
  //   createBoard.updateData
  // ) {
  //   boards.push(createBoard);
  //   result = `${createBoard.id}번째 게시글을 생성 하였습니다.`;
  //   res.status(200).send({
  //     result,
  //   });
  // } else {
  //   result = "입력 요청값이 잘못되었습니다.";
  //   res.status(400).send({
  //     result,
  //   });
  // }
  try{
    const { content, title} = req.body;
    if (!title)  res.status(400).send({msg: "입력 요청값이 잘못되었습니다."});

     const result = await Board.create({
       title: title ? title :null,
       content: content ? content :null
     });
     res.status(201).send({
       msg: `id ${result.id}, ${result.title} 게시글이 생성되었습니다.`
     });
  }catch(err){
    console.log(err);
    res.status(500).send({msg : `서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.`})
  }
});

//게시글 title 변경
boardRouter.put("/:id", async(req, res) => {
  // const check_board = _.find(boards, ["id", parseInt(req.params.id)]);
  // let result;
  // if (check_board) {
  //   boards = boards.map((data) => {
  //     if (data.id === parseInt(req.params.id)) {
  //       data.title = req.body.title;
  //     }
  //     return data;
  //   });
  //   result = "성공적으로 수정 되었습니다.";
  //   res.status(200).send({
  //     result,
  //   });
  // } else {
  //   result = `${req.params.id}번째 게시글이 존재하지 않습니다.`;
  //   res.status(400).send({
  //     result,
  //   });
  // }
  try{
    const { title, content } = req.body;
    let board = await Board.findOne({
    where:{
    id: req.params.id
    }
    })
    if(!board || (!title && !content)){
    res.status(400).send({msg: '게시글이 존재하지 않거나 입력값이 잘못 되었습니다.'});
    }
    if(title) board.title = title;
    if(content) board.content = content;
    await board.save();
    res.status(200).send({msg: '게시글이 정상적으로 수정 되었습니다.'})
    
    }catch(err){
    console.log(err);
    res.status(500).send({msg: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."})
    }
});

//게시글 지우기
boardRouter.delete("/:id", async(req, res) => {
  // const check_board = _.find(boards, ["id", parseInt(req.params.id)]);
  // let result;
  // if (check_board) {
  //   // lodash의 reject 메서드를 이용해 해당 id를 가진 객체를 삭제
  //   boards = _.reject(boards, ["id", parseInt(req.params.id)]);
  //   result = "성공적으로 삭제 되었습니다.";
  //   res.status(200).send({
  //     result,
  //   });
  // } else {
  //   result = `${req.params.id} 번째 게시글이 존재하지 않습니다.`;
  //   res.status(400).send({
  //     result,
  //   });
  // }
  try{
    let board = await Board.findOne({
    where:{
    id: req.params.id
    }
    })
    if(!board){
    res.status(400).send({msg: '게시글이 존재하지 않습니다.'});
    }
    await board.destroy();
    res.status(200).send({msg: '게시글이 정상적으로 삭제 되었습니다.'})
    }catch(err){
    console.log(err);
    res.status(500).send({msg: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."})
    }

});

export default boardRouter;