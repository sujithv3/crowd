const jwt = require("jsonwebtoken");
const jwtDecode = require("jwt-decode");
const msg = require("../configs/message");
const response = require("../configs/response");
import { Request, Response, NextFunction } from "express";
module.exports = {
  genToken(data: any) {
    return jwt.sign(
      {
        data: data,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5 days" }
    );
  },
  verify: async (req: any, res: Response, next: NextFunction) => {
    try {
      // if (
      //   typeof req.cookies.token === "undefined" ||
      //   req.cookies.token === null
      // ) {
      //   return res
      //     .status(412)
      //     .send(response.responseMessage(false, 402, msg.user_login_required));
      // }

      // const verify = jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
      if (!req.headers.authorization) {
        return res
          .status(412)
          .send(response.responseMessage(false, 402, msg.user_login_required));
      }
      let token = req.headers.authorization.slice(7);
      const verify = jwt.verify(token, process.env.SECRET_KEY);

      if (!verify) {
        return res
          .status(402)
          .send(
            res.json(
              response.responseMessage(false, 402, msg.userCreationFailed)
            )
          );
      }
      return next();
    } catch (error) {
      console.log(error);
      return res.status(412).send(response.responseWithData(false, 402, error));
    }
  },
  decode(data: string) {
    let token = data.slice(7);
    const decode = jwtDecode(token);
    return decode.data;
  },
};
