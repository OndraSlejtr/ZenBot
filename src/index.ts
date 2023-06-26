import { main } from "./main";

export const handler = async (event: any, context: any) => {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));

    main();
    return context.logStreamName;
};
