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
          name: "TECH & INNOVATION",
          children: [
            { name: "Audio" },
            { name: "Camera Gear" },
            { name: "Education" },
            { name: "Energy & Green Tech" },
            { name: "Fashion & Wearables" },
            { name: "Food & Beverages" },
            { name: "Health & Fitness" },
            { name: "Home" },
            { name: "Phones & Accessories" },
            { name: "Productivity" },
            { name: "Transportation" },
            { name: "Travel & Outdoors" },
          ]
        },
        {
          name: "CREATIVE WORKS",
          children: [
            { name: "Art" },
            { name: "Comics" },
            { name: "Dance & Theater" },
            { name: "Film" },
            { name: "Music" },
            { name: "Photography" },
            { name: "Podcasts, Blogs & Vlogs" },
            { name: "Tabletop Games" },
            { name: "Video Games" },
            { name: "Web Series & TV Shows" },
            { name: "Writing & Publishing" },
          ]
        },
        {
          name: "COMMUNITY PROJECTS",
          children: [
            { name: "Culture" },
            { name: "Environment" },
            { name: "Human Rights" },
            { name: "Local Businesses" },
            { name: "Wellness" },
          ]
        },

        {
          name: "Information and cultural industries",
          children: [
            { name: "Newspaper, periodical, book and directory publishers" },
            { name: "Software publishers" },
            { name: "Motion picture and sound recording industries" },
            { name: "Broadcasting (except Internet)" },
            { name: "Telecommunications" },
            { name: "Data processing, hosting, and related services" },
            { name: "Other information services" },

          ]
        },
        {
          name: "Tech and Non Tech",
          children: [
            { name: "AI" },
            { name: "Software " },
            { name: "apparel" },
            { name: "Care" },
            { name: "Fintech" },
          ]
        },
        {
          name: "Technology",
          children: [
            { name: "Application Software" },
            { name: "Consumer Internet," },
            { name: "Mobile Tech" },
            { name: "Fintech" },
            { name: "Edu tech" },
            { name: "Health tech" },
            { name: "IOT" },
            { name: "Big data" },
            { name: "Enterprise application" },
            { name: "Cyber Security" },
            { name: "Automotive Industry" },
            { name: "Consumer technology" },
          ]
        },
        {
          name: "Software",
          children: [
            { name: "Consumer and Enterprise Software" },
            { name: "Supply chain software, SaaS" },
            { name: "Augmented reality" },
            { name: "AR" },
            { name: "VR" },
            { name: "Mobility" },
          ]
        },
        {
          name: "E-commerce",
          children: [
            { name: "Retail tech" },
            { name: "Market place" },
            { name: "SaaS" },
            { name: "Media" },
            { name: "Life Style" },
            { name: "Networking" },
          ]
        },
        {
          name: "Food & Baverages",
          children: [
            { name: "Food, Automobile" },
            { name: "Juice Factory" },
            { name: "Bear Industry" },
            { name: "Food tech" },
            { name: "Hotels and restrauant" },
          ]
        },
        {
          name: "Travel & Tourism",
          children: [
            { name: "Travel tech" },
            { name: "Hospitality" },
            { name: "Logistics" },
            { name: "Resort & Hotel" },
            { name: "Automobile" },
            { name: "Aeronautics" },
          ]
        },
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
