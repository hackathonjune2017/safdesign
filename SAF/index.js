
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();

module.context.use(router);
const joi=require('joi');

const db = require('@arangodb').db;
const errors = require('@arangodb').errors;
const foxxColl = db._collection('customer');
const DOC_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;

// Create SAF Service
router.post('/createSAF/:id', function (req, res) {
const clientId=req.pathParams.id;
console.info('createSAF clientId '+clientId);  
const ticketColl = db._collection('ticket');
const ticketId = ticketColl.count()+2;
const ticketJSON ={_key:'tckt_'+ticketId,'ticketId':ticketId,'review_type':'New'}
console.info('createSAF ticketJSON '+ticketJSON);  
ticketColl.save(ticketJSON);

const snapshotColl = db._collection('snapshot');
const snapshotId = snapshotColl.count()+2;
const snapshotJSON ={_key:'snpt_'+snapshotId,'snapshotId':snapshotId,'ticketId':ticketId,'cd_review_type':'NEW'}
console.info('createSAF snapshotJSON '+snapshotJSON);  
snapshotColl.save(snapshotJSON);

const formColl = db._collection('forms');
const safFromJSON ={_key:'saf_'+snapshotId,'question 1':'answer1','question 2':'answer2','type':'SAF'}
const plsFromJSON ={_key:'pls_'+snapshotId,'question 3':'answer3','question 4':'answer4','type':'PLS'}
formColl.save(safFromJSON);
formColl.save(plsFromJSON);

const auditColl = db._collection('audit');
const auditJSON ={'snapshotId':snapshotId,'ticketId':ticketId,'reviewer':'I645580',
                  'action':'claim','status':'inProgress','stage':'Compose satge'}
console.info('createSAF auditJSON '+auditJSON+' collection '+auditColl);  

var auditJSONResult = auditColl.save(auditJSON);


db._collection('customer_ticket_edge').save(
  {
    _from:'customer/'+clientId,
    _to:'ticket/'+ticketJSON._key
  }
);

db._collection('ticket_snapsot_edge').save(
  {
    _from:'ticket/'+ticketJSON._key,
    _to:'snapshot/'+snapshotJSON._key
  }
);

const snapshot_forms_edge = db._collection("snapshot_forms_edge");
snapshot_forms_edge.save(
       {
        '_from':'snapshot/' + snapshotJSON._key,
        '_to' : 'forms/saf_' +snapshotId ,
       }
    );
snapshot_forms_edge.save(
       {
        '_from':'snapshot/' + snapshotJSON._key,
        '_to' : 'forms/pls_' +snapshotId ,
       }
    );

db._collection("ticket_latestStage_edge").save(
  {
    _from:'ticket/'+ticketJSON._key,
    '_to' : 'audit/'+auditJSONResult._key ,
  }
);

db._collection("ticket_audit_edge").save(
  {
    _from:'ticket/'+ticketJSON._key,
    '_to':'audit/'+auditJSONResult._key ,
  }
);


  res.send('snapshot '+snapshotId);
})
.response(['text/plain'], 'Return is snapshotId.')
.summary('Create SAF')
.description('create SAF');


// Create SAF Service
router.post('/approveSAF/', function (req, res) {
const ticketId=req.pathParams.ticketId;
console.info('approve ticketId '+ticketId);  
const ticketColl = db._collection('ticket');


  res.send('ticketId '+ticketId);
})
.body(joi.object().required(), 'Entry to store in the collection.')
.response(['text/plain'], 'Return is snapshotId.')
.summary('Approve SAF')
.description('Approve SAF');



router.post('/loadSAF/:id', function (req, res) {
  
  const snapshotId=req.pathParams.id;
  console.info("loadSAF "+snapshotId);
  var params = {'snapshotId' :snapshotId}
  var query =" for sform in snapshot_forms_edge "+
  "   filter sform._from == 'snapshot/snap_"+snapshotId+"'"+
  "  for form in forms " +
  "   filter form._id==sform._to "+
  "     RETURN form"
console.info(" query "+query);
  var result =db._query(query).toArray();
console.info(" query result "+result);

  res.send(result);
})
.response(joi.object().required(), 'Entry stored in the collection.')
.summary('Create SAF')
.description('create SAF');


