
export default function getChatTime(createdAt) {
    const messageDate = new Date(createdAt);
    const currentDate = new Date()

    const isToday = (messageDate.toDateString()===currentDate.toDateString()) ? true : false;

    const Yesterday = new Date();
    Yesterday.setDate(Yesterday.getDate()-1);

    const isYesterday = (messageDate.toDateString()===Yesterday.toDateString()) ? true : false;

    if(isToday) {
        return messageDate.toLocaleTimeString([],{
            hour : "2-digit",
            minute : "2-digit",
            hour12 : true,
        })
    }

    if(isYesterday) {
        return "Yesterday";
    }

    return messageDate.toLocaleDateString([],{
        day: "2-digit",
        month: "short", //Eg : Feb,Jan
        year : "numeric",
    });

}


