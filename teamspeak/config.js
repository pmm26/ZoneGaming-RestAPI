const private = {
    channel_flag_permanent: 1,
    channel_codec_quality: 10,
    channel_flag_permanent: 1,
    channel_maxclients: 0,
    channel_maxfamilyclients: 0,
    channel_flag_maxclients_unlimited:  0,
    channel_flag_maxfamilyclients_unlimited: 0,
};


const public = {
    channel_flag_permanent: 1,
    channel_codec_quality: 10,
    channel_flag_permanent: 1,
    channel_maxclients: -1,
    channel_maxfamilyclients: -1,
    channel_flag_maxclients_unlimited:  1,
    channel_flag_maxfamilyclients_unlimited: 1,
};

const groupSettings = {
        channelAdmin: 5,
        channelMod: 6,
        channelMember: 7,
        guestChannelGroup: 8,
        serverGroupMember: 7,
        serverGroupTemplate: 9,
    }

let ChannelGroupsAdmin = [ groupSettings.channelAdmin, groupSettings.channelMod, groupSettings.channelMember]

const channelSettings = {
    freeSpacerName: 'Free Channel',
    freeChannelName: '♦ Vaga ♦',
    subChannelName: '● Sala de Convivio',
    awayChannelName: '● AFK/Away',
    spacerBar: '━'
}

notCrawl = [ 398 , 2]


module.exports = {
    ChannelGroupsAdmin,
    private,
    public,
    groupSettings,
    channelSettings,
    notCrawl
};


