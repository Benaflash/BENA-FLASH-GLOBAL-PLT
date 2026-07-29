const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const newScopes = `
googleProvider.addScope("https://www.googleapis.com/auth/drive.metadata.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.addons.student");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.addons.teacher");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.announcements");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.announcements.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.courses");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.coursework.me");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.coursework.me.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.coursework.students");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.coursework.students.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.courseworkmaterials");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.guardianlinks.students");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.profile.emails");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.profile.photos");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.push-notifications");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.rosters");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.rosters.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.student-submissions.me.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.student-submissions.students.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.topics");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.topics.readonly");
`;

content = content.replace(
  'googleProvider.addScope("https://www.googleapis.com/auth/tasks.readonly");',
  'googleProvider.addScope("https://www.googleapis.com/auth/tasks.readonly");' + newScopes
);

fs.writeFileSync('src/lib/firebase.ts', content);
