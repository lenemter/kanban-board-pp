export const initialBoard = {
id: 'board-1',
title: 'Project 1 Board',
columns: [
{ id: 'col-1', title: 'To Do', card_ids: ['card-1', 'card-2'] },
{ id: 'col-2', title: 'In Progress', card_ids: ['card-3'] },
{ id: 'col-3', title: 'Done', card_ids: ['card-4'] },
],
cards: [
{ id: 'card-1', title: 'Literature Review', description: 'Review and summarize 10 academic papers', priority: 'High', assignee: 'Artem', due_date: 'Oct 20', subtasks_total: 3, subtasks_done: 1 },
{ id: 'card-2', title: 'Research Methodology', description: 'Define research methods and approach', priority: 'High', assignee: 'Leo', due_date: 'Oct 22', subtasks_total: 0, subtasks_done: 0 },
{ id: 'card-3', title: 'Data Collection', description: 'Define research methods and approach', priority: 'Medium', assignee: 'Leo', due_date: 'Oct 22', subtasks_total: 0, subtasks_done: 0 },
{ id: 'card-4', title: 'Project Proposal', description: 'Submit initial project proposal document', priority: 'Low', assignee: 'Artem', due_date: 'Oct 10', subtasks_total: 0, subtasks_done: 0 },
],
};