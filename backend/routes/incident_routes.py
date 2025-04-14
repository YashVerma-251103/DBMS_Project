from flask import Blueprint, request, jsonify
import psycopg2
import psycopg2.extras
from db import get_db_connection

bp = Blueprint('incidents', __name__, url_prefix='/incidents')

# Delete an incident record that has been marked as resolved
@bp.route('/resolved', methods=['DELETE'])
def delete_resolved_incident():
    incident_id = request.args.get('id')
    if incident_id is None:
        return jsonify({'error': 'Missing incident id'}), 400
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""DELETE FROM Incident
                   WHERE Incident_Id = %s AND Status = 'Resolved'""", (incident_id,))
    conn.commit()
    affected = cur.rowcount
    cur.close()
    conn.close()
    if affected == 0:
        return jsonify({'error': 'No resolved incident found to delete'}), 404
    return jsonify({'message': 'Incident deleted'})
