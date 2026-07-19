import { Document,Model } from "mongoose";

interface MonthData{
    month:string;
    count:number;

}

export async function generateLast12MonthData<T extends Document>(
    model:Model<T>,
) :Promise<{last12MonthData:MonthData[]}>{
   
   const last12MonthData :MonthData[] = [];
   const currentDate = new  Date();
   currentDate.setDate(1);  

   for(let i=11;i>=0;i--){
    const endDate = new Date (currentDate.getFullYear(),currentDate.getDate()-1 * 28);
    const startDate = new Date (endDate.getFullYear(),endDate.getMonth()- 28);

    const monthYear = endDate.toLocaleDateString('default',{day:"numeric",month:"short",year:"numeric"});
    const count = await model.countDocuments({
        createdAt:{
            $gte:startDate,
            $lte:endDate,
        }
    });

    last12MonthData.push({month:monthYear,count});
   }
 return {last12MonthData}
   
}