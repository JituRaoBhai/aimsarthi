/* PLAN DATA: foundation order, priorities and study times. Everything here is optional.
   Missing values fall back to defaults, and the app tells the learner when topic times are placeholder estimates.
   Per exam key (same keys as exams.js):
     def:    {t:{b,i,a}, m1, m2}   default MINUTES per topic: by level (Beginner/Intermediate/Advanced), for the 1-month plan, for the 2-month plan
     order:  {'Subject':1}         foundation phase: phase 1 is studied before phase 2, and so on
     pri:    {'Subject':80}        subject priority in percent (0-100, higher = more important). Missing = 50
     topics: {'Subject':{'Topic name':{p:90, t:{b:300,i:200,a:120}, m1:60, m2:100}}}
             p  = topic priority percent        t  = minutes by level (b=Beginner, i=Intermediate, a=Advanced)
             m1 = minutes in the 1-month plan (the same for every level)
             m2 = minutes in the 2-month plan (a number, or {b,i,a} if it should differ by level)
   Topic names must match exams.js exactly. When time is short the engine drops the lowest-priority topics first.
   PLAN_CONFIG.dayCap (below): labels and factors of the Heavy Duty / Normal / Full Day chips. */
window.PLAN_CONFIG={m1Days:30,m2Days:60,emit:120,
 dayCap:[['Heavy Duty',0.3],['Normal',1],['Full Day',1.4]]};   // 30 days or fewer to exam = 1-month plan, 60 or fewer = 2-month plan; emit = days of tasks created at once
/* dayCap = the 3 chips on Today (label, factor). A day's study minutes = your daily hours x the factor chosen for that date (S.p.dayCap['YYYY-MM-DD']).
   Heavy Duty/Shift 0.3, Normal 1, Off or Full Study Day 1.4. Factors must stay between 0.1 and 2. 'Normal' (1) must stay in the list. */
window.PLAN={
 neetpg:{
  def:{t:{b:360,i:240,a:150},m1:90,m2:150},          // PLACEHOLDER estimates: replace with real data
  order:{'Anatomy':1,'Physiology':1,'Biochemistry':1,
         'Pathology':2,'Pharmacology':2,'Microbiology':2,'Forensic Medicine':2,'Community Medicine (PSM)':2,
         'Medicine':3,'Surgery':3,'Obstetrics & Gynaecology':3,'Paediatrics':3,
         'ENT':4,'Ophthalmology':4,'Orthopaedics':4,'Dermatology':4,'Psychiatry':4,'Radiology':4,'Anaesthesia':4},
  pri:{},      // add subject priorities here, e.g. 'Medicine':90
  topics:{}    // add topic priorities and times here
 }
};
