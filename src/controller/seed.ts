// created by : vijay
// purpose : category table create update delete and list

import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Category } from "../entity/category";
import { Staging } from "../entity/staging";
const responseMessage = require("../configs/response");
const msg = require("../configs/message");
import { Users } from "../entity/Users";

export class SeedController {
  private categoryRepository = AppDataSource.getRepository(Category);
  private Staging = AppDataSource.getRepository(Staging);
  private userRepository = AppDataSource.getRepository(Users);
  // list all
  async seedStages(request: Request, response: Response, next: NextFunction) {
    try {
      await this.Staging.createQueryBuilder()
        .insert()
        .values([
          { "name": "Pre-seed funding stage", "is_active": true },
          { "name": "Seed funding stage", "is_active": true },
          { "name": "Series A Funding", "is_active": true },
          { "name": "Series B Funding", "is_active": true },
          { "name": "Series C Funding", "is_active": true },
          { "name": "IPO (Initial Public Offering)", "is_active": true }
        ])
        .orIgnore()
        .execute();
      return responseMessage.responseWithData(
        true,
        200,
        msg.categoryListSuccess
      );
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryListFailed,
        err
      );
    }
  }

  async categories(request: Request, response: Response, next: NextFunction) {
    try {

      const data = [
        {
          name: "Technology",
          children: [
            { name: "IT (Information Technology)" },
            { name: "AI (Artificial Intelligence)" },
            { name: "IoT (Internet of Thigs)" },
            { name: "BlockChain" },
            { name: "Cybersecurity" },
            { name: "VR (Virtual Reality)" },
            { name: "Robotics" },
            { name: "Cloud Computing" },
            { name: "Bio Technology" },
          ]
        },
        {
          name: "Consumer",
          children: [
            { name: "E-commerce" },
            { name: "Food and Beverage" },
            { name: "Fashion and Apparel" },
            { name: "Personal Care and Beauty" },
            { name: "Home Goods and Furniture" },
            { name: "Transportation and Mobility" },
            { name: "Education and Training" },
            { name: "Entertainment and Media" },
          ]
        },
        {
          name: "Service",
          children: [
            { name: "Consulting" },
            { name: "Marketing" },
            { name: "Financial Services" },
            { name: "Legal Services" },
            { name: "Human Resources" },
            { name: "Translation and Localization" },
            { name: "Real Estate" },
            { name: "Health and Wellness" },
            { name: "Home Services" },
            { name: "Travel and Hospitality" },
          ]
        },
        {
          name: "Social Enterprise",
          children: [
            { name: "Environmental Sustainability" },
            { name: "Education" },
            { name: "Healthcare" },
            { name: "Poverty Alleviation" },
            { name: "Fair Trade" },
            { name: "Community Development" },
            { name: "Arts and Culture" },
            { name: "Social Innovation" },
          ]
        },
        {
          name: "Lifestyle",
          children: [
            { name: "Health and Wellness" },
            { name: "Food and Nutrition" },
            { name: "Beauty and Personal Care" },
            { name: "Fashion and Apparel" },
            { name: "Travel and Leisure" },
            { name: "Home and Decor" },
            { name: "Pet Care" },
            { name: "Personal Development" },
            { name: "Green Living" },
            { name: "Social Networking" },
          ]
        },
        {
          name: "BioTech",
          children: [
            { name: "Pharmaceutical" },
            { name: "Medical Devices" },
            { name: "Biotech Services" },
            { name: "Agricultural Biotech" },
            { name: "Synthetic Biology" },
            { name: "Biomedical Engineering" },
            { name: "Diagnostics and Personalized Medicine" },
            { name: "Digital Health" },
            { name: "Biodefense and Biosecurity" },
            { name: "Neuroscience" },
          ]
        },
        {
          name: "Healthcare",
          children: [
            { name: "Hospitals and Health Systems" },
            { name: "Health Insurance" },
            { name: "Medical Devices" },
            { name: "Pharmaceuticals" },
            { name: "Telemedicine" },
            { name: "Healthtech" },
            { name: "Home Healthcare" },
            { name: "Health and Wellness" },
            { name: "Behavioral Health" },
            { name: "Long-Term Care" },
          ]
        },
        {
          name: "Manufaturing",
          children: [
            { name: "3D Printing/Additive Manufacturing" },
            { name: "Robotics and Automation" },
            { name: "Advanced Materials:" },
            { name: "Clean Technology" },
            { name: "Consumer Goods" },
            { name: "Food and Beverage" },
            { name: "Medical Devices" },
            { name: "Electronics and Hardware" },
            { name: "Transportation" },
            { name: "Industrial Manufacturing" },
          ]
        },
        {
          name: "Fintech",
          children: [
            { name: "Payments and Transfers" },
            { name: "Online Lending" },
            { name: "Digital Banks" },
            { name: "Personal Finance Managemen" },
            { name: "Cryptocurrencies and Blockchain" },
            { name: "Insurance Technology" },
            { name: "Wealth Management" },
            { name: "Financial Infrastructure" },
            { name: "Regulatory Technology" },
          ]
        }
      ];

      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        let parentData = await this.categoryRepository.findOne({
          where: { name: item.name },
        });
        let categoryId;
        if (parentData) {
          categoryId = parentData.id;
        } else { // new data
          const category = new Category();
          category.name = item.name;
          category.parent_id = 0;
          category.is_active = true;
          category.is_deleted = false;

          await this.categoryRepository.save(category);

          parentData = await this.categoryRepository.findOne({
            where: { name: item.name },
          });

          categoryId = parentData.id;
        }

        for (let j = 0; j < item.children.length; j++) {

          const subItem = item.children[j];
          const categoryData = await this.categoryRepository.findOne({
            where: { name: subItem.name },
          });
          if (!categoryData) { //new data
            const category = new Category();
            category.name = subItem.name;
            category.is_active = true;
            category.is_deleted = false;
            category.parent_id = parentData.id;
            category.parent = parentData;
            const categoryInsert = await this.categoryRepository.save(category);
          }

        }

      }

      return responseMessage.responseMessage(
        true,
        200,
        msg.categoryCreateSuccess
      );
    } catch (err) {
      console.log('err', err);
      return responseMessage.responseWithData(
        false,
        400,
        msg.categoryCreateFailed,
        err
      );
    }
  }
}
