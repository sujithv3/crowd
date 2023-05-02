const jwt = require("jsonwebtoken");
const jwtDecode = require("jwt-decode");
const msg = require("../configs/message");
const response = require("../configs/response");
import { Request, Response, NextFunction } from "express";
module.exports = {
  genToken(data: any) {
    try {
      return jwt.sign(
        {
          data: data,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "5 days" }
      );
    } catch (err) {
      console.log('err', err);
      console.log('data', data);
    }
  },
  verify: async (req: any, res: Response, next: NextFunction) => {
    try {
      let token: any;

      if (
        typeof req.cookies.token === "undefined" ||
        req.cookies.token === null
      ) {
        if (!req.headers.authorization) {
          return (
            res
              .status(401)
              // .send(response.responseMessage(false, 402, msg.user_login_required))
              .redirect(`/?auth=""`)
          );
        } else {
          token = req.headers.authorization.slice(7);
        }
      } else {
        token = req.cookies.token;
      }

      const verify = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // console.log(verify);
      if (!verify) {
        return (
          res
            .status(401)
            // .send(
            //   res.json(
            //     response.responseMessage(false, 402, msg.userCreationFailed)
            //   )
            // )
            .redirect(`/?auth=""`)
        );
      }
      return next();
    } catch (error) {
      console.log(error);
      return (
        res
          .status(401)
          // .send(response.responseWithData(false, 402, error))
          .redirect(`/?auth=""`)
      );
    }
  },
  decode(data: string) {
    let token = data;
    const decode = jwtDecode(token);
    return decode.data;
  },
};
