CREATE TABLE public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  push_token text,
  last_seen  timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE public.pairs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a       uuid NOT NULL REFERENCES public.profiles(id),
  user_b       uuid REFERENCES public.profiles(id),
  pair_code    text UNIQUE NOT NULL,
  status       text DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE public.reminders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id      uuid NOT NULL REFERENCES public.pairs(id) ON DELETE CASCADE,
  created_by   uuid NOT NULL REFERENCES public.profiles(id),
  target_user  uuid NOT NULL REFERENCES public.profiles(id),
  type         text NOT NULL,
  message      text NOT NULL,
  emoji        text DEFAULT '💌',
  remind_time  time NOT NULL,
  repeat_days  int[] DEFAULT '{1,2,3,4,5,6,7}',
  is_active    boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE public.confirmations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id  uuid NOT NULL REFERENCES public.reminders(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES public.profiles(id),
  status       text NOT NULL CHECK (status IN ('done', 'skip')),
  note         text,
  photo_url    text,
  date         date DEFAULT CURRENT_DATE,
  responded_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reminders_pair ON public.reminders(pair_id);
CREATE INDEX idx_reminders_target ON public.reminders(target_user);
CREATE INDEX idx_confirmations_reminder ON public.confirmations(reminder_id);
CREATE INDEX idx_confirmations_date ON public.confirmations(date);
CREATE INDEX idx_pairs_code ON public.pairs(pair_code);

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_select_partner" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT CASE WHEN user_a = auth.uid() THEN user_b ELSE user_a END
      FROM public.pairs
      WHERE (user_a = auth.uid() OR user_b = auth.uid())
        AND status = 'active'
    )
  );

CREATE POLICY "pairs_select" ON public.pairs
  FOR SELECT USING (user_a = auth.uid() OR user_b = auth.uid());

CREATE POLICY "pairs_insert" ON public.pairs
  FOR INSERT WITH CHECK (user_a = auth.uid());

CREATE POLICY "pairs_update" ON public.pairs
  FOR UPDATE USING (user_b = auth.uid() AND status = 'pending');

CREATE POLICY "reminders_select" ON public.reminders
  FOR SELECT USING (
    pair_id IN (
      SELECT id FROM public.pairs
      WHERE (user_a = auth.uid() OR user_b = auth.uid())
        AND status = 'active'
    )
  );

CREATE POLICY "reminders_insert" ON public.reminders
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "reminders_update" ON public.reminders
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "reminders_delete" ON public.reminders
  FOR DELETE USING (created_by = auth.uid());

CREATE POLICY "confirmations_select" ON public.confirmations
  FOR SELECT USING (
    reminder_id IN (
      SELECT r.id FROM public.reminders r
      JOIN public.pairs p ON r.pair_id = p.id
      WHERE p.user_a = auth.uid() OR p.user_b = auth.uid()
    )
  );

CREATE POLICY "confirmations_insert" ON public.confirmations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "confirmations_update" ON public.confirmations
  FOR UPDATE USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.confirmations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;

ALTER TABLE public.confirmations ADD CONSTRAINT confirmations_unique UNIQUE (reminder_id, date, user_id);

CREATE POLICY "proofs_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'proofs' AND auth.role() = 'authenticated');

CREATE POLICY "proofs_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'proofs');

CREATE OR REPLACE FUNCTION join_pair(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_pair pairs%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE pairs
  SET user_b = v_user_id, status = 'active'
  WHERE pair_code = upper(p_code)
    AND status = 'pending'
    AND user_b IS NULL
  RETURNING * INTO v_pair;

  IF v_pair.id IS NULL THEN
    RAISE EXCEPTION 'Kode tidak valid atau sudah digunakan';
  END IF;

  RETURN to_jsonb(v_pair);
END;
$$;

CREATE OR REPLACE FUNCTION disconnect_pair()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE pairs
  SET status = 'inactive', user_b = NULL
  WHERE id IN (
    SELECT id FROM pairs
    WHERE (user_a = v_user_id OR user_b = v_user_id)
      AND status = 'active'
  );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tidak ada pasangan aktif';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION generate_pair_code()
RETURNS text AS $$
DECLARE
  chars  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i      int;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
