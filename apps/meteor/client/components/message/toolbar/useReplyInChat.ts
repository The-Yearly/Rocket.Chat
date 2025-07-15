import { type IMessage, type ISubscription, type IRoom, isE2EEMessage } from '@rocket.chat/core-typings';
import { useUser } from '@rocket.chat/ui-contexts';
import { useCallback } from 'react';

import type { MessageActionConfig } from '../../../../app/ui-utils/client/lib/MessageAction';
import { useEmbeddedLayout } from '../../../hooks/useEmbeddedLayout';
import { useReactiveValue } from '../../../hooks/useReactiveValue';
import { roomCoordinator } from '../../../lib/rooms/roomCoordinator';

export const useReplyInChat = (
    message: IMessage,
    { room, subscription }: { room: IRoom; subscription: ISubscription | undefined },
): MessageActionConfig | null => {
    const user = useUser();
    const encrypted = isE2EEMessage(message);
    const isLayoutEmbedded = useEmbeddedLayout();

    const condition = useReactiveValue(
        useCallback(() => {
            if (!subscription || room.t === 'd' || room.t === 'l' || isLayoutEmbedded) {
                return false;
            }


            return true;
        }, [isLayoutEmbedded, message.u._id, room.t, subscription, user]),
    );

    if (!condition) {
        return null;
    }

    return {
        id: 'reply-in-chat',
        icon: 'reply-directly',
        label: 'Reply_in_chat',
        context: ['message', 'message-mobile', 'threads', 'federated'],
        type: 'communication',
        action(){
                roomCoordinator.openRouteLink(
                            room.t,
                            { name: room._id },
                            {
                                reply: message._id,
                            },
                        );
        },
        order: 0,
        group: 'menu',
        disabled: encrypted,
    };
};
