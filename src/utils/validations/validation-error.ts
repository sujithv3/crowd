import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";

module.exports = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: Function) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};
