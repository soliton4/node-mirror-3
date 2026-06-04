import { v4 as uuidv4 } from "uuid";


const types = {
  
}

const useId = (data)=>{
  if (data.id){
    return data.id;
  }
  return uuidv4();
};

const uiFactory = {
  create:  () => {
    return {

      createError: (message)=>{
        return {
          type: "error",
          message: message,
          id: uuidv4(),
        }
      },
      createEnd: ()=>{
        return {
          type: "end",
          id: uuidv4()
        }
      },
      createNode: (data)=>{
        let typeEntry = types[data.type];
        if (!typeEntry){
          return {
            type: "error",
            message: "unknown type: " + data.type,
            data: data,
            id: useId(data)
          }
        }
        let retData = typeEntry.create(data);
        // making sure it has an id
        retData.id = useId(retData);
        return retData;
      }
      
    };
  },
  
};



export default uiFactory;


