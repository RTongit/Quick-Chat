
    export default function formatDateDDMMYY(val) {
        if(!val) return `??`;
        const formatDate = new Date(val);
        const day = String(formatDate.getDate()).padStart(2,"0");
        const month = String(formatDate.getMonth()+1).padStart(2,"0");
        const year = String(formatDate.getFullYear())
        return `${day}-${month}-${year}`;
    }


