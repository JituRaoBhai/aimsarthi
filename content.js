/* OWN CONTENT YOU SHIP WITH THE APP (optional). Everything here shows up in the Study tab for every user, marked "From AceLife".
   Users can still add their own items; theirs can be edited or deleted, yours cannot.
   x (optional) = exam key such as 'neetpg'. Leave it out to show the item for every exam.  s (optional) = subject name exactly as in exams.js.
   After editing, redeploy and bump the cache name (const V) in sw.js so the update reaches phones.

   Examples (remove the // to use):
   vid:  {t:'Cardiac cycle in 10 minutes', u:'https://www.youtube.com/watch?v=XXXXXXXXXXX', s:'Physiology', x:'neetpg'}
   chan: {t:'Exam updates channel', u:'https://t.me/yourpublicchannel'}
   crs:  {t:'Crash course', u:'https://example.com/course', note:'Offered by Example Academy'}
   note: {t:'High-yield: Brachial plexus', s:'Anatomy', text:'Roots C5-T1 ...'}
   fc:   {id:'phy-001', s:'Physiology', f:'Where is the cardiac pacemaker?', b:'SA node'}      // give every flashcard a unique, never-changing id
*/
window.STUDY_CONTENT={vid:[],chan:[],crs:[],note:[],fc:[]};
