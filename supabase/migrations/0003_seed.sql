-- Phase 2 seed: DUMMY content only. All names and text are fictional placeholders.
-- Safe to re-run: rows are keyed by slug and skipped if they already exist.
-- Edit or delete any of it later from /admin.

insert into public.series (title, slug, description, author) values
  ('Reading the Bible Well', 'reading-the-bible-well', 'A sample series on interpreting Scripture faithfully.', 'Dr Alice Morgan'),
  ('Foundations of Doctrine', 'foundations-of-doctrine', 'A sample introduction to core Christian doctrines.', 'Dr Samuel Price'),
  ('Preaching Christ', 'preaching-christ', 'A sample series on preaching from the whole Bible.', 'Rev Daniel Hughes')
on conflict (slug) do nothing;

insert into public.content_items (kind, title, slug, author, summary, body, read_minutes, topics, scripture, series_id, featured, published_at) values
  ('article','Why Does Theology Matter?','why-does-theology-matter','Dr Alice Morgan','Theology is not a distraction from discipleship; it is the shape of it.',E'This is placeholder text for a sample article.\n\nReplace it with real content from the admin area.',3,'{doctrine,discipleship}','John 17:3',null,true, now() - interval '1 day'),
  ('article','Five Tips for Studying the Bible Effectively','five-tips-studying-bible','Dr Samuel Price','Practical habits for reading Scripture in context.',E'Sample article body.\n\nEdit me in /admin.',4,'{bible,study}','2 Timothy 3:16-17',null,true, now() - interval '2 days'),
  ('article','What Language Was the Bible Written In?','what-language-was-the-bible-written-in','Dr Alice Morgan','Hebrew, Aramaic and Greek: a short orientation.',E'Sample article body.\n\nEdit me in /admin.',3,'{bible,languages}','Nehemiah 8:8',null,false, now() - interval '3 days'),
  ('article','Endurance in the Christian Life','endurance-christian-life','Rev Daniel Hughes','Running the race with our eyes on Christ.',E'Sample article body.\n\nEdit me in /admin.',3,'{discipleship}','Hebrews 12:1-2',null,true, now() - interval '4 days'),
  ('devotional','Learning to Love','learning-to-love','Rev Daniel Hughes','A short reflection on love that outlasts everything.',E'Sample devotional text for 1 Corinthians 13.\n\nPause and pray through the passage.',2,'{love,discipleship}','1 Corinthians 13:1-3',null,false, now()),
  ('devotional','Rest for the Weary','rest-for-the-weary','Dr Alice Morgan','Finding rest in Christ during a busy term.',E'Sample devotional text.\n\nEdit me in /admin.',2,'{rest,study}','Matthew 11:28-30',null,false, now() - interval '1 day'),
  ('video','Four Steps Backward','four-steps-backward','Dr Samuel Price','A short sample teaching video.',E'Sample video description. Add a YouTube or Vimeo link in media_url.',12,'{apologetics}','Romans 1:18-20',null,false, now() - interval '1 day'),
  ('video','Preaching Christ from the Old Testament','preaching-christ-old-testament','Rev Daniel Hughes','How the Old Testament points to Jesus.',E'Sample video description.',15,'{preaching,old-testament}','Luke 24:27',(select id from public.series where slug='preaching-christ'),true, now() - interval '5 days'),
  ('podcast','Church History in Five Minutes','church-history-five-minutes','Dr Samuel Price','A sample bite-sized podcast episode.',E'Sample podcast notes. Add an audio link in media_url.',5,'{church-history}','',null,true, now() - interval '2 days'),
  ('podcast','The Union Podcast: Welcome','union-podcast-welcome','Union Team','Sample introductory episode.',E'Sample podcast notes.',20,'{community}','',null,false, now()),
  ('qa','How Can I Deal with Fear?','how-can-i-deal-with-fear','Dr Alice Morgan','A sample question and answer.',E'Q: How can I deal with fear?\n\nA: Sample answer text. Edit me in /admin.',4,'{discipleship,fear}','Psalm 56:3-4',null,false, now() - interval '6 days'),
  ('qa','Can I Study Theology Alongside Full-Time Work?','study-alongside-work','Admissions Team','A sample question for prospective students.',E'Q: Can I study while working?\n\nA: Sample answer. Many students study part time.',3,'{study,admissions}','',null,false, now() - interval '7 days'),
  ('article','Reading Genesis 1','reading-genesis-1','Dr Alice Morgan','Part 1 of the sample series.',E'Sample article body.',6,'{bible,old-testament}','Genesis 1:1-5',(select id from public.series where slug='reading-the-bible-well'),false, now() - interval '8 days'),
  ('article','The Doctrine of God','the-doctrine-of-god','Dr Samuel Price','Part 1 of the sample doctrine series.',E'Sample article body.',7,'{doctrine}','Exodus 3:14',(select id from public.series where slug='foundations-of-doctrine'),false, now() - interval '9 days'),
  ('news','Applications Open for Autumn 2026','applications-open-autumn-2026','Union Team','Sample news: applications are open for all programmes.',E'Sample news story.\n\nEdit or delete it in /admin.',1,'{admissions}','',null,false, now() - interval '1 day'),
  ('news','New Learning Community Launches','new-learning-community-launches','Union Team','Sample news: a new Learning Community begins.',E'Sample news story.',1,'{community}','',null,false, now() - interval '10 days')
on conflict (slug) do nothing;

insert into public.courses (level, title, slug, summary, description, duration, mode, next_start, sort_order) values
  ('foundation','Foundations in Theology','foundations-in-theology','A gentle start to theological study.',E'Sample description.\n\nCovers the basics of Bible, doctrine and church history.','1 year part time','Online / Learning Community','September 2026',1),
  ('foundation','Certificate in Christian Ministry','certificate-christian-ministry','Practical grounding for ministry.',E'Sample description.','1 year part time','Online','September 2026',2),
  ('ba','BA (Hons) Theology','ba-theology','A full undergraduate degree in theology.',E'Sample description.\n\nValidated by a partner university (placeholder).','3 years full time / 6 years part time','Online / Learning Community','September 2026',1),
  ('ba','BA (Hons) Theology and Ministry','ba-theology-ministry','Theology with practical ministry training.',E'Sample description.','3 years full time','Learning Community','September 2026',2),
  ('ma','MA Theology','ma-theology','Advanced study across the theological disciplines.',E'Sample description.','2 years part time','Online / Learning Community','September 2026',1),
  ('ma','MA Church History','ma-church-history','Study the history of the church in depth.',E'Sample description.','2 years part time','Online','September 2026',2),
  ('gdip','Graduate Diploma in Theology','gdip-theology','Postgraduate study for those new to theology.',E'Sample description.','1 year full time / 2 years part time','Online / Learning Community','September 2026',1),
  ('mth','MTh Theology','mth-theology','A research-informed master''s degree.',E'Sample description.','2 years part time','Learning Community','September 2026',1),
  ('phd','PhD Theology','phd-theology','Doctoral research supervised by Union faculty.',E'Sample description.','3-4 years','Research','Rolling',1),
  ('short','Introduction to Systematic Theology','intro-systematic-theology','A short course for the curious.',E'Sample description.','8 weeks','Online','January 2027',1),
  ('short','Reading the Old Testament','reading-old-testament','A short course on the Old Testament.',E'Sample description.','6 weeks','Online','February 2027',2),
  ('language','Biblical Greek','biblical-greek','Learn to read the New Testament in Greek.',E'Sample description.','1 year part time','Online','September 2026',1),
  ('language','Biblical Hebrew','biblical-hebrew','Learn to read the Old Testament in Hebrew.',E'Sample description.','1 year part time','Online','September 2026',2)
on conflict (slug) do nothing;

insert into public.events (title, slug, kind, description, starts_at, location, featured) values
  ('Online Open Event', 'online-open-event', 'open-day', 'Meet the team and ask questions about studying at Union (sample).', now() + interval '18 days', 'Online', true),
  ('Ministry Centre Open Day', 'ministry-centre-open-day', 'open-day', 'Visit the Ministry Centre (sample).', now() + interval '56 days', 'Ministry Centre, Wales', false),
  ('Evening Lecture: Why Theology Matters', 'evening-lecture-why-theology-matters', 'lecture', 'A sample public lecture.', now() + interval '32 days', 'Online', false),
  ('Research Conference', 'research-conference', 'conference', 'A sample annual research conference.', now() + interval '170 days', 'London', false),
  ('Student Welcome Weekend', 'student-welcome-weekend', 'other', 'A sample welcome event for new students.', now() + interval '40 days', 'Ministry Centre, Wales', false)
on conflict (slug) do nothing;

insert into public.people (name, role, bio, sort_order)
select * from (values
  ('Dr Alice Morgan', 'Professor of Biblical Studies', 'Fictional placeholder biography. Replace in /admin.', 1),
  ('Dr Samuel Price', 'Lecturer in Systematic Theology', 'Fictional placeholder biography.', 2),
  ('Rev Daniel Hughes', 'Director of Ministry Training', 'Fictional placeholder biography.', 3),
  ('Dr Ruth Evans', 'Lecturer in Church History', 'Fictional placeholder biography.', 4),
  ('Grace Williams', 'Head of Admissions', 'Fictional placeholder biography.', 5)
) as v(name, role, bio, sort_order)
where not exists (select 1 from public.people);

insert into public.communities (name, location, description, contact_email, sort_order)
select * from (values
  ('Bristol Learning Community', 'Bristol', 'Sample Learning Community description.', 'bristol@example.com', 1),
  ('Manchester Learning Community', 'Manchester', 'Sample Learning Community description.', 'manchester@example.com', 2),
  ('Edinburgh Learning Community', 'Edinburgh', 'Sample Learning Community description.', 'edinburgh@example.com', 3),
  ('Cardiff Learning Community', 'Cardiff', 'Sample Learning Community description.', 'cardiff@example.com', 4)
) as v(name, location, description, contact_email, sort_order)
where not exists (select 1 from public.communities);

insert into public.testimonials (quote, name, programme)
select * from (values
  ('Studying alongside my church ministry was the perfect fit.', 'Sample Student', 'MTh'),
  ('It has grown my love for Jesus and equipped me to serve him better.', 'Sample Student', 'GDip'),
  ('Quality, sound biblical education that fits around life.', 'Sample Student', 'BA (Hons)'),
  ('I found everything I was looking for in one place.', 'Sample Student', 'MA')
) as v(quote, name, programme)
where not exists (select 1 from public.testimonials);

insert into public.pages (slug, title, body) values
  ('fees', 'Fees and Funding', E'Placeholder information about tuition fees.\n\nPlaceholder information about scholarships, bursaries and payment plans.'),
  ('accommodation', 'Accommodation', E'Placeholder information about accommodation at the Ministry Centre and nearby.'),
  ('apply', 'Enquire and Apply', E'Placeholder text explaining how to enquire and apply.\n\nUse the buttons below to reach the official forms.'),
  ('ministry-centre', 'Ministry Centre', E'Placeholder description of the Ministry Centre in Wales.'),
  ('church', 'Union and Your Church', E'Placeholder text about partnering with Union to grow leaders through a Learning Community.'),
  ('beliefs', 'What We Believe', E'Placeholder doctrinal statement. Replace with the official statement of faith.'),
  ('give', 'Give', E'Placeholder text about becoming a Friend of Union and supporting the ministry.'),
  ('support', 'Library and Student Support', E'Placeholder information about the library, wellbeing and student support services.'),
  ('alumni', 'Alumni', E'Placeholder information for Union alumni.')
on conflict (slug) do nothing;
