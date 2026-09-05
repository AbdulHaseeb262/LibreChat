import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import type { TMessageContentParts } from 'librechat-data-provider';
import type { TMessageProps, TMessageIcon } from '~/common';
import {
  cn,
  getMessageAriaLabel,
  areMessageRowPropsEqual,
  getHeaderPrefixForScreenReader,
} from '~/utils';
import { useMessageHelpers, useLocalize, useAttachments, useContentMetadata } from '~/hooks';
import AuthorHeader from '~/components/Chat/Messages/Content/Parts/AuthorHeader';
import { getHeaderModelName } from '~/components/Chat/Messages/ui/HeaderLabel';
import { revealOnRowHoverClasses, messageFooterClasses } from './styles';
import MessageRow from '~/components/Chat/Messages/ui/MessageRow';
import MessageIcon from '~/components/Chat/Messages/MessageIcon';
import Elapsed, { shouldShowElapsed } from './Elapsed';
import ContentParts from './Content/ContentParts';
import SiblingSwitch from './SiblingSwitch';
import HoverButtons from './HoverButtons';
import SubRow from './SubRow';
import store from '~/store';

// Solvane: seconds from submission to first text, per reply.
const solvaneThought = new Map<string, number>();

function MessageParts(props: TMessageProps) {
  const localize = useLocalize();
  const { message, siblingIdx, siblingCount, setSiblingIdx } = props;
  const { attachments, searchResults } = useAttachments({
    messageId: message?.messageId,
    attachments: message?.attachments,
  });
  const {
    edit,
    index,
    agent,
    isLast,
    enterEdit,
    assistant,
    handleScroll,
    conversation,
    isSubmitting,
    latestMessageId,
    handleContinue,
    copyToClipboard,
    getCanCopy,
    regenerateMessage,
  } = useMessageHelpers(props);

  const maximizeChatSpace = useRecoilValue(store.maximizeChatSpace);
  // Solvane: "Thought for Ns" — measured from the submission start (rc2's own
  // clock) to the first text of THIS reply. Module-level so it survives
  // re-renders; empty after a reload, so the line simply does not show.
  const submissionStart = useRecoilValue(store.submissionStartFamily(index));
  const { messageId = null, isCreatedByUser } = message ?? {};
  const hasText = Array.isArray(message?.content)
    ? (message?.content as Array<{ type?: string; text?: string | { value?: string } }>).some(
        (c) => c?.type === 'text' && ((typeof c.text === 'string' ? c.text : c.text?.value) ?? '').length > 0,
      )
    : (message?.text ?? '').length > 0;
  if (
    isCreatedByUser !== true && messageId && hasText && submissionStart != null &&
    isSubmitting && messageId === latestMessageId && !solvaneThought.has(messageId)
  ) {
    solvaneThought.set(messageId, Math.max(0, (Date.now() - submissionStart) / 1000));
  }
  const thought = messageId ? solvaneThought.get(messageId) : undefined;

  const name = useMemo(() => {
    let result = '';
    if (isCreatedByUser === true) {
      result = localize('com_user_message');
    } else if (assistant) {
      result = assistant.name ?? localize('com_ui_assistant');
    } else if (agent) {
      result = agent.name ?? localize('com_ui_agent');
    }

    return result;
  }, [assistant, agent, isCreatedByUser, localize]);

  const iconData: TMessageIcon = useMemo(
    () => ({
      endpoint: message?.endpoint ?? conversation?.endpoint,
      model: message?.model ?? conversation?.model,
      iconURL: message?.iconURL ?? conversation?.iconURL,
      modelLabel: name,
      isCreatedByUser: message?.isCreatedByUser,
    }),
    [
      name,
      conversation?.endpoint,
      conversation?.iconURL,
      conversation?.model,
      message?.model,
      message?.iconURL,
      message?.endpoint,
      message?.isCreatedByUser,
    ],
  );

  const authorHeader = useMemo(
    () =>
      isCreatedByUser === true ? undefined : (
        <AuthorHeader
          icon={<span className={isSubmitting && messageId === latestMessageId && isCreatedByUser !== true ? 'solvane-glow inline-flex' : 'inline-flex'}><MessageIcon iconData={iconData} assistant={assistant} agent={agent} /></span>}
          label={name}
        />
      ),
    [isCreatedByUser, iconData, assistant, agent, name, isSubmitting, messageId, latestMessageId],
  );

  const { hasParallelContent } = useContentMetadata(message);

  if (!message) {
    return null;
  }

  return (
    <div
      className="w-full border-0 bg-transparent"
      onWheel={handleScroll}
      onTouchMove={handleScroll}
    >
      <div className="m-auto justify-center px-4 py-3 sm:px-0">
        <MessageRow
          id={messageId ?? ''}
          icon={<span className={isSubmitting && messageId === latestMessageId && isCreatedByUser !== true ? 'solvane-glow inline-flex' : 'inline-flex'}><MessageIcon iconData={iconData} assistant={assistant} agent={agent} /></span>}
          label={name}
          hoverLabel={getHeaderModelName(
            agent?.model,
            assistant?.model,
            message.model,
            conversation?.model,
          )}
          timestamp={message.createdAt ?? message.clientTimestamp}
          ariaLabel={getMessageAriaLabel(message, localize)}
          headerPrefix={getHeaderPrefixForScreenReader(message, localize)}
          isCreatedByUser={isCreatedByUser === true}
          hasParallelContent={hasParallelContent}
          fullWidth={maximizeChatSpace}
          isEditing={edit}
          footer={
            <SubRow classes={cn(messageFooterClasses, isCreatedByUser && 'justify-end')}>
              {/* While the answer is generating every other action is withheld, which
                  would otherwise leave this counter sitting alone under a half-written
                  response. It reveals on hover there, like the actions it sits with. */}
              <SiblingSwitch
                siblingIdx={siblingIdx}
                siblingCount={siblingCount}
                setSiblingIdx={setSiblingIdx}
                className={cn(
                  isSubmitting && messageId === latestMessageId && revealOnRowHoverClasses,
                )}
              />
              {shouldShowElapsed({
                isSubmitting,
                isLatestMessage: messageId === latestMessageId,
                isCreatedByUser,
                siblingIdx,
                siblingCount,
              }) && <Elapsed index={index} />}
              <HoverButtons
                index={index}
                isEditing={edit}
                message={message}
                enterEdit={enterEdit}
                isSubmitting={isSubmitting}
                conversation={conversation ?? null}
                regenerate={() => regenerateMessage()}
                copyToClipboard={copyToClipboard}
                getCanCopy={getCanCopy}
                handleContinue={handleContinue}
                latestMessageId={latestMessageId}
                isLast={isLast}
              />
            </SubRow>
          }
        >
          {thought != null && thought >= 0.3 && (
            <div className="solvane-meta" aria-label="Time to first word">
              Thought for {thought < 10 ? thought.toFixed(1) : Math.round(thought)}s
              {message.model ? <span> · {message.model}</span> : null}
            </div>
          )}
          <ContentParts
            edit={edit}
            isLast={isLast}
            enterEdit={enterEdit}
            siblingIdx={siblingIdx}
            attachments={attachments}
            isSubmitting={isSubmitting}
            searchResults={searchResults}
            manualSkills={message.manualSkills}
            messageId={message.messageId}
            authorHeader={authorHeader}
            setSiblingIdx={setSiblingIdx}
            isCreatedByUser={message.isCreatedByUser}
            conversationId={conversation?.conversationId}
            isLatestMessage={messageId === latestMessageId}
            content={message.content as Array<TMessageContentParts | undefined>}
          />
        </MessageRow>
      </div>
    </div>
  );
}

export default React.memo(MessageParts, areMessageRowPropsEqual);
