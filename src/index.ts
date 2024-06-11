import { main } from './main';

export type APIGatewayProxyHandlerV2<T = never> = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2<T>>;

import 'dotenv/config';
import { Handler, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (event: any, context: any) => {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));

    const slackers = main();
    return slackers;
};
