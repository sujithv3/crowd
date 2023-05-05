// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { rmAdmin } from "../../entity/rmAdmin";
import { Tagged } from "../../entity/tagged";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("../../utils/jsonwebtoken");
import { ChatOnline, USER_TYPE } from "../../entity/chatOnline";
import { Users } from "../../entity/Users";
import { ChatGroup, GROUP_TYPE } from "../../entity/chatGroup";
import { ChatMessage } from "../../entity/chatMessages";
import { ChatGroupMember, MEMBER_TYPE } from "../../entity/chatGroupMembers";


export class TaggedRM {
  private taggedRepository = AppDataSource.getRepository(Tagged);
  // private userRepository = AppDataSource.getRepository(rmAdmin);
  // private userRepository = AppDataSource.getRepository(Users);
  private ChatOnlineRepository = AppDataSource.getRepository(ChatOnline);
  private ChatMessageRepository = AppDataSource.getRepository(ChatMessage);
  private ChatGroupMemberRepository = AppDataSource.getRepository(ChatGroupMember);
  private ChatGroupRepository = AppDataSource.getRepository(ChatGroup);


  //   assign rm or start up

  async assignTag(request: Request, response: Response, next: NextFunction) {
    try {
      //   tagged
      const { rm_id, start_up } = request.body;

      for (let i = 0; i < start_up.length; i++) {
        // add to chat Groups
        // find group exists
        let group = await this.ChatGroupRepository.createQueryBuilder('group')
          .innerJoin('group.members', 'startup', 'startup.user_id=:startup_id', { startup_id: start_up[i] }) // find startup with members
          .innerJoin('group.members', 'user', 'user.execuive_id=:user_id', { user_id: start_up[i] }) // find investor with members
          .where('group.type=:type AND group.is_active=true', { type: GROUP_TYPE.STARTUP }).getOne();
        console.log('group_member', group);

        //if not create a group
        if (!group) { // create group
          // create group
          group = await this.ChatGroupRepository.save({
            type: GROUP_TYPE.STARTUP,
            count: 2,
            title: 'individual user'
          });

          // create 2 members for this group
          console.log('result', group);
          const member1 = await this.ChatGroupMemberRepository.save({
            user_type: MEMBER_TYPE.STARTUP,
            user: { id: start_up[i] },
            group: { id: group.id }
          });

          const member2 = await this.ChatGroupMemberRepository.save({
            user_type: MEMBER_TYPE.RM,
            executive: { id: rm_id },
            group: { id: group.id }
          });
        }

        if (group && group.id > 0) { // post message
          // update group to active
          await this.ChatGroupRepository.createQueryBuilder('group').
            update().
            set({ is_active: true })
            .where('id="id', { id: group.id })

        }

        this.taggedRepository.save({
          StartUp: start_up[i],
          RelationManager: rm_id,
          createdDate: new Date(),
          updatedDate: new Date(),
        });
      }
      return responseMessage.responseMessage(true, 200, msg.tagged_success);
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.tagged_failed,
        err
      );
    }
  }

  // un assign rm

  async unAssignTag(request: Request, response: Response, next: NextFunction) {
    try {
      //   tagged
      const { start_up } = request.body;

      for (let i = 0; i < start_up.length; i++) {
        // disable groups

        let group = await this.ChatGroupRepository.createQueryBuilder('group')
          .innerJoin('group.members', 'startup', 'startup.user_id=:startup_id', { startup_id: start_up[i] }) // find startup with members
          .innerJoin('group.members', 'user', 'user.execuive_id=:user_id', { user_id: start_up[i] }) // find RM with members
          .where('group.type=:type', { type: GROUP_TYPE.STARTUP }).getOne();
        console.log('group_member', group);

        if (group && group.id > 0) { // post message
          // update group to active
          await this.ChatGroupRepository.createQueryBuilder('group').
            update().
            set({ is_active: false })
            .where('id="id', { id: group.id })

        }

        this.taggedRepository
          .createQueryBuilder()
          .update(Tagged)
          .set({
            is_active: false,
          })
          .where("StartUp=:StartUp ", {
            StartUp: start_up[i],
          })
          .execute();
      }
      return responseMessage.responseWithData(true, 200, msg.un_tagged_success);
    } catch (err) {
      return responseMessage.responseWithData(
        false,
        400,
        msg.un_tagged_failed,
        err
      );
    }
  }
}
