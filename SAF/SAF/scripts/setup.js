'use strict';
const db = require('@arangodb').db;

var collections = ['customer','ticket', 'snapshot','forms','audit'];

collections.forEach(function(collection){
if (!db._collection(collection)) {
  db._createDocumentCollection(collection);

}
//db._collection(collection).truncate();
});

var edgeCollections = ['client_party_edge','snapshot_forms_edge','customer_latestform_edge',
                        'customer_ticket_edge','ticket_snapsot_edge','ticket_audit_edge','ticket_latestStage_edge'  ];

edgeCollections.forEach(function(edgeCollection){
if (!db._collection(edgeCollection)) {
  db._createEdgeCollection(edgeCollection);
}
//db._collection(edgeCollection).truncate();
});

// Collection Data population
const customerCollection = db._collection("customer");
customerCollection.truncate();

    [
    {_key: '123456', id: '123456', name: 'Luke Skywalker.',idType:'IND'},
    {_key: '123486', id: '123486', name: 'Han Solo',idType:'NIND'},
    {_key: '156486', id: '156486', name: 'Leia Organa',idType:'IND'},
    {_key: '156465', id: '156465', name: 'Kylo Ren',idType:'IND'},
    {_key: '234245', id: '234245', name: 'Alex jan',idType:'IND'},
    {_key: '454353', id: '454353', name: 'rohi sal',idType:'IND'},
    {_key: '231313', id: '231313', name: 'Kylo ren',idType:'IND'},
  ].forEach(function (customerDoc) {
    customerCollection.save(customerDoc);
  });

// client_party_edge data population
const client_party_edgeCollection = db._collection("client_party_edge");
client_party_edgeCollection.truncate();

[
    ['123456', '234245','AH'],
    ['123486', '156486','AH'],
    ['123486', '156465','BO'],
    ['454353', '231313','ADHO'],
  ].forEach(function (pair) {
    client_party_edgeCollection.save(
       {
        '_from':'customer/' + pair[0],
        '_to' : 'customer/' + pair[1],
        'relation': pair[2]
       }
    );
  });



