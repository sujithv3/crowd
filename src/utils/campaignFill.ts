const msg = require("../configs/message");

export const isDataFilled = async (pageKey: string, userId, campaignRepository, teamRepository) => {
    try {
        let teams;
        console.log('working')
        const campaigns = await campaignRepository
            .createQueryBuilder('campaign')
            .where("campaign.user_id=:id AND campaign.is_active=true AND campaign.is_published=false", {
                id: userId,
            })
            .leftJoinAndSelect("campaign.category", "category")
            .leftJoinAndSelect("campaign.subcategory", "subcategory")
            .getOne();

        let message = '';
        let filled = true;

        console.log('working', campaigns)
        if (!campaigns) {
            filled = false;
            message = msg.createStartCampaignFirst;
        }
        // provide in descending order
        switch (pageKey) {
            case 'bank':
                if (!(campaigns?.payment_contact_email_id && campaigns?.citizen_status)) {
                    filled = false;
                    message = msg.fillPayment;
                }
            case 'payment':
                if (!(campaigns?.goal_amount && campaigns?.deal_size && campaigns?.start_date)) {
                    filled = false;
                    message = msg.fillFunding;
                }
            case 'funding':
                teams = await teamRepository
                    .createQueryBuilder("team")
                    .where("team.campaign = :id", { id: campaigns.id })
                    .getMany();
                if (!(teams && teams.length > 0)) {
                    filled = false;
                    message = msg.fillTeam;
                }
            case 'teams':
                // checkbasic Project details filled
                if (!(campaigns?.description && campaigns?.challenges)) {
                    filled = false;
                    message = msg.fillProjectDetail;
                }
            case 'project':
                // checkbasic Project details filled
                if (!(campaigns?.title && campaigns?.tag_line && campaigns?.project_image)) {
                    filled = false;
                    message = msg.fillBasicInfo;
                }
            case 'basicInfo':
                console.log('value', campaigns?.category?.id && campaigns?.subcategory?.id)
                console.log('value2', campaigns?.category?.id, campaigns?.subcategory?.id)
                if (!(campaigns?.category?.id && campaigns?.subcategory?.id)) {
                    filled = false;
                    message = msg.createStartCampaignFirst;
                }
        }
        return {
            filled,
            message,
            campaigns
        }
    } catch (err) {
        console.log('err', err);
    }
}