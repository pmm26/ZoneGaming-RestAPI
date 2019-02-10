
const groupSettings = {
        channelAdmin: 5,
        channelMod: 6,
        channelMember: 7,
        guestChannelGroup: 8,
        serverGroupMember: 7,
        serverGroupTemplate: 9,
        gameServerGroupTemplate: 9,
    }

const ChannelGroupsAdmin = [ groupSettings.channelAdmin, groupSettings.channelMod, groupSettings.channelMember]


const createChannelServerGroups = [11, 12]

const channelSettings = {
    freeSpacerName: 'Free Channel',
    freeChannelName: '♦ Vaga ♦',
    subChannelName: '● Sala de Convivio',
    awayChannelName: '● AFK/Away',
    spacerBar: '━'
}

const notCrawl = [398, 2]


module.exports = {
    createChannelServerGroups,
    ChannelGroupsAdmin,
    groupSettings,
    channelSettings,
    notCrawl
};


