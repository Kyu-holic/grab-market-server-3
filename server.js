const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});
const port = 8080;

app.use(express.json());
app.use(cors());

app.get("/products", (req, res) => {
  models.Product.findAll({
    order: [["createdAt", "DESC"]],
    attributes: ["id", "name", "seller", "price", "createdAt", "imageUrl"],
  })
    .then((result) => {
      console.log("PRODUCTS : ", result);
      res.send({
        products: result,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send("에러 발생");
    });
});

app.get("/products/:id", (req, res) => {
  const { params } = req;
  const { id } = params;
  models.Product.findOne({
    where: {
      id: id,
    },
  })
    .then((result) => {
      console.log("PRODUCT : ", result);
      res.send({
        product: result,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send("상품 조회에 에러가 발생했습니다.");
    });
});

app.post("/products", (req, res) => {
  const body = req.body;
  const { name, price, seller, description } = body;
  if (!name || !price || !seller | !description) {
    res.status(40).send("모든 필드를 입력해 주세요.");
  }
  models.Product.create({
    name,
    price,
    seller,
    description,
  })
    .then((result) => {
      console.log("상품 생성 결과 :", result);
      res.send({
        result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send("상품 업로드에 문제가 발생했습니다.");
    });
});

app.post("/image", upload.single("image"), (req, res) => {
  const file = req.file;
  res.send({
    imageUrl: file.path,
  });
});

app.listen(port, () => {
  console.log("그랩의 쇼핑몰 서버가 돌아가고 있습니다.");
  models.sequelize
    .sync()
    .then(() => {
      console.log("DB 연결 성공!");
    })
    .catch((err) => {
      console.log("DB 연결 에러 :", error);
      process.exit();
    });
});
