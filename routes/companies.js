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
  let companyCode = req.params.code
  console.log(companyCode,'<<<<<<<<<<<<<<<<')
  const results = await db.query(
    `SELECT c.code, c.name, c.description, i.id, i.amt, i.paid, i.add_date, i.paid_date
    FROM companies as c
    JOIN invoices as i
    ON c.code = i.comp_code
    WHERE c.code = $1
    `,
    [companyCode]
  );
  if(!results.rows) throw new NotFoundError('No invoice found')
  let company = results.rows
  console.log(results)
  let { code, name, description } = results.rows[0]
  let invoices = results.rows.map((row) => {
    return row.id
  });
  let response = {
    code,
    name,
    description,
    invoices
  }
  if (!company) throw new NotFoundError(`Not found ${code}`);
  return res.json({ response });
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
  const results = await db.query(
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