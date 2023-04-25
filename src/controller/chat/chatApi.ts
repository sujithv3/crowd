// created by : Muthukumar
// purpose : Campaign list view for carousel view for dashboard & investor

import { AppDataSource } from "../../data-source";
import { NextFunction, Request, Response } from "express";
import { Campaigns, CAMPAIGN_STATUS } from "../../entity/campaigns";
const responseMessage = require("../../configs/response");
const msg = require("../../configs/message");
const Jwt = require("./../../utils/jsonwebtoken");
var async = require("async");
var request = require("request");
var archiver = require("archiver");
import { Staging } from "../../entity/staging";
const mqtt = require('mqtt');

export class ChatApiController {
    private campaignRepository = AppDataSource.getRepository(Campaigns);
    private StagingRepository = AppDataSource.getTreeRepository(Staging);

    async initConnection() {
        const qos = 0;
        const host = '127.0.0.1';
        const clientId = 'AdecMqttserver';
        const port = 8083;
        const url = `ws://${host}:${port}/mqtt`;
        const mqttOptions = {
            clientId: clientId,
            keepalive: 0,
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            will: {
                topic: 'WillMsg',
                payload: 'Connection Closed abnormally..!',
                qos: qos,
                retain: false
            },
            rejectUnauthorized: false
        };
        return mqtt.connect(url, mqttOptions)
    }

    async postTextMessage(req: Request, res: Response, next: NextFunction) {

        try {
            // const client = this.initConnection();
            // client.publish(topic, payload, { qos }, (error: any) => {
            //     if (error) {
            //         console.log('Publish error: ', error);
            //     }
            // });
            return responseMessage.responseWithData(
                true,
                200,
                msg.chat_post_success
            );
        } catch (error) {
            console.log(error);
            return responseMessage.responseWithData(
                false,
                400,
                msg.chat_post_success,
                error
            );
        }
    }
}
