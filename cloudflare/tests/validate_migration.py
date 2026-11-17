"""SQLite contract tests for the initial Ether Tours D1 migration."""
from pathlib import Path
import sqlite3

DB = Path(__file__).resolve().parents[1] / "migrations" / "0001_initial.sql"


def expect_integrity_error(connection, statement, params=()):
    try:
        connection.execute(statement, params)
    except sqlite3.IntegrityError:
        return
    raise AssertionError(f"Expected integrity failure: {statement}")


def main():
    db = sqlite3.connect(":memory:")
    db.execute("PRAGMA foreign_keys=ON")
    db.executescript(DB.read_text(encoding="utf-8"))

    tables = {row[0] for row in db.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    )}
    required = {
        "destinations", "tours", "tour_destinations", "itinerary_days",
        "tour_pricing", "tour_inclusions", "tour_media", "enquiries",
        "enquiry_items", "enquiry_events", "notification_outbox",
    }
    assert required <= tables, required - tables

    db.execute(
        "INSERT INTO destinations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)",
        ("d1", "Murchison Falls", "murchison-falls", "2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z"),
    )
    db.execute(
        """INSERT INTO tours(id,slug,title,summary,duration_days,created_at,updated_at)
           VALUES(?,?,?,?,?,?,?)""",
        ("t1", "murchison", "Murchison Falls", "Wildlife tour", 3,
         "2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z"),
    )
    db.execute("INSERT INTO tour_destinations VALUES('t1','d1')")
    expect_integrity_error(
        db,
        """INSERT INTO tours(id,slug,title,summary,duration_days,created_at,updated_at)
           VALUES('bad','bad','Bad','Bad',0,'now','now')""",
    )
    expect_integrity_error(
        db,
        """INSERT INTO tour_pricing(id,tour_id,currency,pricing_basis,amount_minor)
           VALUES('p1','t1','UGX','per_person',NULL)""",
    )
    db.execute(
        """INSERT INTO enquiries(id,reference,customer_name,email,privacy_notice_version,created_at,updated_at)
           VALUES('e1','ETH-123','Test Guest','guest@example.test','v1','now','now')"""
    )
    db.execute(
        """INSERT INTO notification_outbox(id,aggregate_id,event_key,payload_json,available_at,created_at,updated_at)
           VALUES('o1','e1','enquiry:e1:created','{}','now','now','now')"""
    )
    expect_integrity_error(
        db,
        """INSERT INTO notification_outbox(id,aggregate_id,event_key,payload_json,available_at,created_at,updated_at)
           VALUES('o2','e1','enquiry:e1:created','{}','now','now','now')""",
    )
    assert db.execute("PRAGMA foreign_key_check").fetchall() == []
    print("Ether Tours D1 migration: schema, constraints, relationships and outbox idempotency passed")


if __name__ == "__main__":
    main()
