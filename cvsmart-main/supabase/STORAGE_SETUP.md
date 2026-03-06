# Profile images storage

For avatar uploads on the profile page to work:

1. In **Supabase Dashboard** go to **Storage**.
2. Click **New bucket**.
3. Name: `profile-images`
4. Enable **Public bucket** (so avatar URLs work without signed URLs).
5. Click **Create bucket**.
6. Open the bucket → **Policies** → **New policy**.
7. Use a policy that allows authenticated users to upload, update, and delete their own files. Example for **INSERT**:
   - Policy name: `Users can upload own avatar`
   - Allowed operation: **INSERT**
   - Target roles: `authenticated`
   - USING expression: `true` (or restrict by path if you use `avatars/{user_id}/*`)
   - WITH CHECK: `true`
8. Add similar policies for **UPDATE** and **DELETE** if you want users to replace or remove their avatar.

If you prefer to allow all authenticated users to manage any file in this bucket (simplest for avatars):

- **INSERT**: WITH CHECK `true`
- **UPDATE**: USING `true`, WITH CHECK `true`
- **DELETE**: USING `true`
- **SELECT**: USING `true` (for public read)

Then avatar uploads should succeed.
