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
      let token: any;

      if (
        typeof req.cookies.token === "undefined" ||
        req.cookies.token === null
      ) {
        if (!req.headers.authorization) {
          res.redirect(`/?auth=""`);
          return res
            .status(412)
            .send(
              response.responseMessage(false, 402, msg.user_login_required)
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
        res.redirect(`/?auth=""`);
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
      res.redirect(`/?auth=""`);
      console.log(error);
      return res.status(412).send(response.responseWithData(false, 402, error));
    }
  },
  decode(data: string) {
    let token = data;
    const decode = jwtDecode(token);
    return decode.data;
  },
};
