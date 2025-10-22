-- Add SELECT policy for expenses so users can read their own expenses
CREATE POLICY "allow_select_own_expenses" ON "public"."expenses"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);