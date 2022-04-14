"use strict"

const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError.js");
const router = new express.Router();

/** GET /companies: get list of companies */
router.get("/", async function (req, res) {
  const results = await db.query(
    ` SELECT  code, name
      FROM  companies
    `);
  const companies = results.rows
  return res.json({ companies })
});

// /** GET /company/:name: return single company */
router.get("/:code", async function (req, res) {
  let code = req.params.code
  const results = await db.query(
    `SELECT code, name, description
    FROM companies
    WHERE code = $1
    `,
    [code]
  );
  let company = results.rows[0]
  if (!company) throw new NotFoundError(`Not found ${code}`);
  return res.json({ company });
});

// /** POST /company/ create single company */
router.post("/", async function (req, res) {
  const { code, name, description } = req.body
  const results = await db.query(
    `INSERT INTO companies( code, name, description )
     VALUES ($1, $2, $3)
     RETURNING code, name, description
    `,
    [code, name, description]
  );
  let company = results.rows[0]
  return res.json({ company });
});

// /** PUT /company/ update single company */
router.put("/:code", async function (req, res) {
  const code = req.params.code
  const { name, description } = req.body
  const results = await db.query(
    `UPDATE companies
      SET name=$1, description=$2
      WHERE code = $3
      RETURNING code, name, description
    `,
    [name, description, code]
  );
  let company = results.rows[0]
  if (!company) throw new NotFoundError(`Not found ${code}`);
  return res.json({ company });
});


// /** DELETE /companies/:code delete single company */
router.delete("/:code", async function (req, res) {
  const code = req.params.code
 const results =  await db.query(
    `DELETE FROM companies
     WHERE code = $1
     RETURNING code
    `,
    [code]
  );
  let company = results.rows[0]
  if (!company) throw new NotFoundError(`Not found ${code}`);
  return res.json({ status: `DELETED ${code}` });
});

module.exports = router;