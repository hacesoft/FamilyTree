<?php
return ['routes'=>[
 ['name'=>'page#index','url'=>'/','verb'=>'GET'],
 ['name'=>'genealogy#trees','url'=>'/api/trees','verb'=>'GET'],['name'=>'genealogy#createTree','url'=>'/api/trees','verb'=>'POST'],
 ['name'=>'genealogy#dashboard','url'=>'/api/dashboard','verb'=>'GET'],
 ['name'=>'genealogy#tree','url'=>'/api/trees/{id}','verb'=>'GET'],['name'=>'genealogy#updateTree','url'=>'/api/trees/{id}','verb'=>'PUT'],['name'=>'genealogy#deleteTree','url'=>'/api/trees/{id}','verb'=>'DELETE'],
 ['name'=>'genealogy#createPerson','url'=>'/api/trees/{treeId}/people','verb'=>'POST'],['name'=>'genealogy#updatePerson','url'=>'/api/people/{id}','verb'=>'PUT'],['name'=>'genealogy#deletePerson','url'=>'/api/people/{id}','verb'=>'DELETE'],
 ['name'=>'genealogy#createChild','url'=>'/api/trees/{treeId}/children','verb'=>'POST'],
 ['name'=>'genealogy#setParents','url'=>'/api/people/{id}/parents','verb'=>'POST'],
 ['name'=>'genealogy#movePerson','url'=>'/api/people/{id}/position','verb'=>'PUT'],['name'=>'genealogy#movePeople','url'=>'/api/trees/{treeId}/positions','verb'=>'POST'],['name'=>'genealogy#resetLayout','url'=>'/api/trees/{treeId}/layout/reset','verb'=>'POST'],
 ['name'=>'genealogy#createRelation','url'=>'/api/trees/{treeId}/relationships','verb'=>'POST'],['name'=>'genealogy#deleteRelation','url'=>'/api/relationships/{id}','verb'=>'DELETE'],
 ['name'=>'genealogy#createEvent','url'=>'/api/people/{personId}/events','verb'=>'POST'],['name'=>'genealogy#deleteEvent','url'=>'/api/events/{id}','verb'=>'DELETE'],
 ['name'=>'genealogy#createTreeDocument','url'=>'/api/trees/{treeId}/documents','verb'=>'POST'],['name'=>'genealogy#updateDocument','url'=>'/api/documents/{id}','verb'=>'PUT'],['name'=>'genealogy#deleteDocument','url'=>'/api/documents/{id}','verb'=>'DELETE'],
 ['name'=>'genealogy#saveShare','url'=>'/api/trees/{treeId}/shares','verb'=>'POST'],['name'=>'genealogy#deleteShare','url'=>'/api/shares/{id}','verb'=>'DELETE'],
 ['name'=>'genealogy#previewResearch','url'=>'/api/trees/{treeId}/research/preview','verb'=>'POST'],
 ['name'=>'genealogy#importResearch','url'=>'/api/trees/{treeId}/research/import','verb'=>'POST'],
 ['name'=>'genealogy#researchMedia','url'=>'/api/research/media/{id}','verb'=>'GET'],
]];
