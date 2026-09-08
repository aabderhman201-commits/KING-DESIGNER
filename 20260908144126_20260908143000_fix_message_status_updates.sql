/*
# Fix message status updates and message request visibility

1. Database Functions
- Add `mark_messages_seen` so a conversation member can mark received messages as seen.
- Add `mark_message_voice_heard` so a conversation member can mark a received voice message as heard.

2. Security
- Both functions run with controlled database privileges.
- Each function derives the caller from `auth.uid()` and verifies conversation membership.
- Anonymous callers cannot execute either function.

3. Important Notes
- No message content, ownership, or conversation data is changed.
- The functions only update status fields on messages received by the authenticated caller.
*/

CREATE OR REPLACE FUNCTION public.mark_messages_seen(p_message_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.messages AS m
  SET status = 'seen'
  WHERE m.id = ANY(p_message_ids)
    AND m.sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.conversations AS c
      WHERE c.id = m.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_messages_seen(uuid[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.mark_messages_seen(uuid[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_message_voice_heard(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.messages AS m
  SET voice_heard = true
  WHERE m.id = p_message_id
    AND m.sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.conversations AS c
      WHERE c.id = m.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_message_voice_heard(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.mark_message_voice_heard(uuid) TO authenticated;