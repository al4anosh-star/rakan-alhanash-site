-- بعد إنشاء المستخدم من Authentication → Users، ضع إيميله هنا وشغّل:
insert into admins (user_id)
select id from auth.users where email = 'ضع-الإيميل-هنا'
on conflict do nothing;
